"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import TaskCard from "@/components/TaskCard";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseSession } from "@/lib/fetchSupabaseSession";

interface Profile {
  id: string;
  username: string;
}

interface Member {
  user_id: string;
  role: string;
  profiles?: Profile;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  slug: string;
  status: string;
  due_date?: string;
  priority?: "low" | "medium" | "high";
  project_id: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  slug: string;
  owner_id: string;
}

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const projectSlug = params.projectSlug as string;
  const { user, loading: authLoading } = useSupabaseSession(); // use per-page session
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const fetchData = useCallback(async () => {
    if (!user) return;

    const userId = user.id;

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", projectSlug)
      .single();

    if (projectError || !projectData) {
      console.error("Error fetching project:", projectError?.message);
      return;
    }

    setProject(projectData);
    setIsOwner(userId === projectData.owner_id);

    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectData.id);

    if (tasksError) console.error("Error fetching tasks:", tasksError.message);

    const typedTasks: Task[] = (tasksData || []).map((t) => ({
      ...t,
      slug: t.slug || "",
      status: t.status || "todo",
    }));

    setTasks(typedTasks);

    const { data: membersData, error: membersError } = await supabase
      .from("project_members")
      .select("user_id, role, profiles(id, username)")
      .eq("project_id", projectData.id);

    if (membersError) console.error("Error fetching members:", membersError.message);

    const mappedMembers: Member[] =
      membersData?.map((m) => ({
        user_id: m.user_id,
        role: m.role,
        profiles: m.profiles?.[0],
      })) || [];

    setMembers(mappedMembers);
  }, [projectSlug, user]);

  const handleAddMember = async () => {
    if (!newMemberEmail || !project || !user) return;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("email", newMemberEmail)
      .single();

    if (profileError || !profile) {
      alert("User not found");
      return;
    }

    if (members.find((m) => m.user_id === profile.id)) {
      alert("User is already a member");
      return;
    }

    const { error } = await supabase.from("project_members").insert({
      project_id: project.id,
      user_id: profile.id,
      role: "member",
    });

    if (error) {
      alert("Failed to add member: " + error.message);
      return;
    }

    setMembers([...members, { user_id: profile.id, role: "member", profiles: profile }]);
    setNewMemberEmail("");
  };

  const handleRemoveMember = async (userId: string) => {
    if (!project) return;

    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("project_id", project.id)
      .eq("user_id", userId);

    if (error) {
      alert("Failed to remove member: " + error.message);
      return;
    }

    setMembers(members.filter((m) => m.user_id !== userId));
  };

  // Redirect unauthorized users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/"); // redirect to login
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user) fetchData();
  }, [authLoading, user, fetchData]);

  if (authLoading || !user || !project) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{project.name}</h2>
      <p className="mb-4">{project.description}</p>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Tasks</h3>
        <Link
          href={`/dashboard/${project.slug}/tasks/create`}
          className="bg-green-500 text-white p-2 rounded"
        >
          + New Task
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} projectSlug={project.slug} />
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">Project Members</h3>
        <ul className="mb-4">
          {members.map((m) => (
            <li key={m.user_id} className="flex justify-between items-center mb-1">
              <span>
                {m.profiles?.username || m.user_id} ({m.role})
              </span>
              {isOwner && m.user_id !== user.id && (
                <button
                  onClick={() => handleRemoveMember(m.user_id)}
                  className="text-xs px-2 py-1 bg-red-600 rounded hover:bg-red-500"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>

        {isOwner && (
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="User Email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="border p-2 rounded flex-1"
            />
            <button
              onClick={handleAddMember}
              className="bg-blue-500 text-white px-4 rounded"
            >
              Add Member
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
