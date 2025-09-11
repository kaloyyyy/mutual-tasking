"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import TaskCard from "@/components/TaskCard";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseSession } from "@/lib/fetchSupabaseSession";
import BackButton from "@/components/BackButton";

interface Profile { id: string; username: string; }
interface Member { user_id: string; role: string; profiles?: Profile; }
interface Task { id: string; title: string; description?: string; slug: string; status: string; due_date?: string; priority?: "low" | "medium" | "high"; project_id: string; }
interface Project { id: string; name: string; description?: string; slug: string; owner_id: string; }

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const projectSlug = params.projectSlug as string;
  const { user, loading: authLoading } = useSupabaseSession();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const fetchData = useCallback(async () => {
    if (!user) return;

    const { data: projectData } = await supabase.from("projects").select("*").eq("slug", projectSlug).single();
    if (!projectData) return;

    setProject(projectData);
    setIsOwner(user.id === projectData.owner_id);

    const { data: tasksData } = await supabase.from("tasks").select("*").eq("project_id", projectData.id);
    setTasks((tasksData || []).map((t) => ({ ...t, slug: t.slug || "", status: t.status || "todo" })));

    const { data: membersData } = await supabase
      .from("project_members")
      .select(`user_id, role, profiles!inner(id, username)`)
      .eq("project_id", projectData.id);

    setMembers((membersData || []).map((m) => ({
      user_id: m.user_id,
      role: m.role,
      profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
    })));
  }, [projectSlug, user]);

  const handleAddMember = async () => {
    if (!newMemberEmail || !project) return;

    const { data: profileData } = await supabase.from("profiles").select("id, username, email").eq("email", newMemberEmail).single();
    if (!profileData) return alert("User not found");

    const { error } = await supabase.from("project_members").insert([{ project_id: project.id, user_id: profileData.id, role: "member" }]);
    if (error) return alert(error.message);

    setMembers((prev) => [...prev, { user_id: profileData.id, role: "member", profiles: profileData }]);
    setNewMemberEmail("");
  };

  const handleRemoveMember = async (userId: string) => {
    if (!project) return;
    const { error } = await supabase.from("project_members").delete().eq("project_id", project.id).eq("user_id", userId);
    if (error) return alert(error.message);
    setMembers((prev) => prev.filter((m) => m.user_id !== userId));
  };

  useEffect(() => { if (!authLoading && !user) router.push("/"); }, [authLoading, user, router]);
  useEffect(() => { if (!authLoading && user) fetchData(); }, [authLoading, user, fetchData]);

  if (authLoading || !user || !project) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-medium text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Project Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-semibold">{project.name}</h2>
        {project.description && <p className="text-gray-300 mt-1 text-base">{project.description}</p>}
      </div>

      {/* Tasks Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <h3 className="text-2xl font-semibold mb-2 sm:mb-0">Tasks</h3>
        <Link
          href={`/dashboard/${project.slug}/tasks/create`}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-md font-medium transition"
        >
          + New Task
        </Link>
      </div>

      {/* Task Cards */}
      {tasks.length === 0 ? (
        <p className="text-gray-400 text-base mb-8">No tasks yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} projectSlug={project.slug} />
          ))}
        </div>
      )}

      {/* Members Section */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2">Project Members</h3>
        <ul className="mb-4 space-y-2">
          {members.map((m) => (
            <li key={m.user_id} className="flex justify-between items-center bg-gray-800 p-2 rounded text-md">
              <span>{m.profiles?.username || m.user_id} ({m.role})</span>
              {isOwner && m.user_id !== user.id && (
                <button
                  onClick={() => handleRemoveMember(m.user_id)}
                  className="px-3 py-1 text-md bg-red-600 rounded hover:bg-red-500 text-white transition"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>

        {isOwner && (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="User Email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="border border-gray-700 p-2 rounded flex-1 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-md"
            />
            <button
              onClick={handleAddMember}
              className="px-4 py-1 text-md bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition"
            >
              Add Member
            </button>
          </div>
        )}
      </div>

      <BackButton className="" />
    </div>
  );
}
