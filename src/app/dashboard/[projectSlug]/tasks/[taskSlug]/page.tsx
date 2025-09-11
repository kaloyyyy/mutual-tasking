"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
interface Assignee {
  id: string; // profile id
  username: string;
  email?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  slug: string;
  status: "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  due_date?: string;
}

export default function TaskPage() {
  const { projectSlug, taskSlug } = useParams() as {
    projectSlug: string;
    taskSlug: string;
  };
  const router = useRouter();

  const statuses: ("todo" | "in-progress" | "done")[] = ["todo", "in-progress", "done"];

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [assignees, setAssignees] = useState<Assignee[]>([]);

  const [newAssigneeEmail, setNewAssigneeEmail] = useState("");

  // Fetch task + assignees
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1️⃣ Fetch project
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("slug", projectSlug)
        .single();

      if (!project) {
        setLoading(false);
        return;
      }

      // 2️⃣ Fetch task
      const { data: task } = await supabase
        .from("tasks")
        .select("*")
        .eq("slug", taskSlug)
        .eq("project_id", project.id)
        .single();

      setTask(task);

      if (task) {
        // 1️⃣ Fetch task assignee IDs
        const { data: assigneeIds, error: assigneeIdsError } = await supabase
          .from("task_assignees")
          .select("user_id")
          .eq("task_id", task.id);

        if (assigneeIdsError) {
          console.error("Error fetching task assignee IDs:", assigneeIdsError.message);
          return;
        }

        const userIds = assigneeIds.map(a => a.user_id);

        // 2️⃣ Fetch profiles only (no email)
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError.message);
          return;
        }

        setAssignees(profiles || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [projectSlug, taskSlug]);

  const handleStatusChange = async (newStatus: "todo" | "in-progress" | "done") => {
    if (!task) return;
    setUpdating(true);

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", task.id);

    if (!error) setTask({ ...task, status: newStatus });
    else alert("Failed to update status");

    setUpdating(false);
  };


  // Delete task
  const handleDelete = async () => {
    if (!task || !confirm("Are you sure you want to delete this task?")) return;

    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (!error) router.push(`/dashboard/${projectSlug}`);
    else alert("Failed to delete task");
  };

  // Add assignee
  const handleAddAssignee = async () => {
    if (!task || !newAssigneeEmail.trim()) return;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, username")
      .eq("email", newAssigneeEmail.trim())
      .single();

    if (profileError || !profile) {
      alert("User not found");
      return;
    }

    const { error: insertError } = await supabase
      .from("task_assignees")
      .insert({ task_id: task.id, user_id: profile.id });

    if (insertError) {
      alert("Failed to assign user");
      return;
    }

    setAssignees([
      ...assignees,
      { id: profile.id, username: profile.username, email: profile.email }
    ]);
    setNewAssigneeEmail("");
  };

  // Remove assignee
  const handleRemoveAssignee = async (userId: string) => {
    if (!task) return;

    const { error } = await supabase
      .from("task_assignees")
      .delete()
      .eq("task_id", task.id)
      .eq("user_id", userId);

    if (!error) setAssignees(assignees.filter((a) => a.id !== userId));
    else alert("Failed to remove assignee");
  };

  if (loading) return <div className="p-4 text-gray-400">Loading...</div>;
  if (!task) return <div className="p-4 text-red-400">Task not found</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{task.title}</h1>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/${projectSlug}/tasks/${task.slug}/edit`}
            className="px-3 py-1 text-sm rounded bg-yellow-600 text-white hover:bg-yellow-500"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      <p className="mt-2 text-gray-400">{task.description}</p>

      <div className="mt-4 space-y-2">
        <p>
          <span className="font-semibold">Status:</span>{" "}
          <span className="capitalize">{task.status}</span>
        </p>
        <p>
          <span className="font-semibold">Priority:</span>{" "}
          <span className="capitalize">{task.priority || "not set"}</span>
        </p>
        {task.due_date && (
          <p className="text-sm text-gray-500">
            Due Date: {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Status buttons */}
      <div className="mt-3 flex gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            disabled={updating || task.status === s}
            className={`px-3 py-1 rounded text-sm ${task.status === s
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
          >
            {s}
          </button>
        ))}
      </div>


      {/* Assignees */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Assigned Users</h3>
        {assignees.length > 0 ? (
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            {assignees.map((a) => (
              <li key={a.id} className="flex justify-between items-center">
                {a.username || "No username"}
                <button
                  onClick={() => handleRemoveAssignee(a.id)}
                  className="text-xs px-2 py-1 bg-red-600 rounded hover:bg-red-500"
                >
                  Remove
                </button>
              </li>
            ))}

          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No one assigned yet.</p>
        )}


        {/* Add assignee */}
        <div className="mt-3 flex gap-2">
          <input
            type="email"
            placeholder="Enter user email"
            value={newAssigneeEmail}
            onChange={(e) => setNewAssigneeEmail(e.target.value)}
            className="flex-1 px-2 py-1 text-sm rounded bg-gray-800 text-white border border-gray-600"
          />
          <button
            onClick={handleAddAssignee}
            className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-500"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
