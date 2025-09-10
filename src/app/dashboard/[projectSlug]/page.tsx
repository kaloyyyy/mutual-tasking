"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import TaskCard from "@/components/TaskCard";
import Link from "next/link";

export default function ProjectDetail() {
  const params = useParams();
  const projectSlug = params.projectSlug as string;
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const fetchData = async () => {
    // get current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || null;
    setCurrentUserId(userId);

    // fetch project
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", projectSlug)
      .single();

    if (projectError) {
      console.error("Error fetching project:", projectError.message);
      return;
    }

    if (!projectData) return;

    setProject(projectData);
    setIsOwner(userId === projectData.owner_id);

    // fetch tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectData.id);
    if (tasksError) console.error("Error fetching tasks:", tasksError.message);
    setTasks(tasksData || []);

    // fetch members
    const { data: membersData, error: membersError } = await supabase
      .from("project_members")
      .select("user_id, role, profiles(id, username)")
      .eq("project_id", projectData.id);
    if (membersError) console.error("Error fetching members:", membersError.message);
    setMembers(membersData || []);
  };

  useEffect(() => {
    fetchData();
  }, [projectSlug]);

  const handleAddMember = async () => {
    if (!newMemberEmail || !project) return;

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

  if (!project) return <div>Loading...</div>;

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
              {isOwner && m.user_id !== currentUserId && (
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
