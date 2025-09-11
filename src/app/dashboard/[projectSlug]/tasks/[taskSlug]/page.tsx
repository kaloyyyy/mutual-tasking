"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/BackButton";

interface Assignee {
  id: string;
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("slug", projectSlug)
        .single();

      if (!project) {
        setLoading(false);
        return;
      }

      const { data: task } = await supabase
        .from("tasks")
        .select("*")
        .eq("slug", taskSlug)
        .eq("project_id", project.id)
        .single();

      setTask(task);

      if (task) {
        const { data: assigneeIds } = await supabase
          .from("task_assignees")
          .select("user_id")
          .eq("task_id", task.id);

        const userIds = assigneeIds?.map(a => a.user_id) || [];

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, email")
          .in("id", userIds);

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

  const handleDelete = async () => {
    if (!task || !confirm("Are you sure you want to delete this task?")) return;

    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (!error) router.push(`/dashboard/${projectSlug}`);
    else alert("Failed to delete task");
  };

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

    setAssignees([...assignees, { id: profile.id, username: profile.username, email: profile.email }]);
    setNewAssigneeEmail("");
  };

  const handleRemoveAssignee = async (userId: string) => {
    if (!task) return;

    const { error } = await supabase
      .from("task_assignees")
      .delete()
      .eq("task_id", task.id)
      .eq("user_id", userId);

    if (!error) setAssignees(assignees.filter(a => a.id !== userId));
    else alert("Failed to remove assignee");
  };

  if (loading) return <div className="p-4 text-gray-400">Loading...</div>;
  if (!task) return <div className="p-4 text-red-400">Task not found</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-900 rounded-lg shadow-lg text-gray-100">
  <div className="flex justify-between items-center">
    <h1 className="text-3xl font-bold">{task.title}</h1>
    <div className="flex gap-2">
      <Link
        href={`/dashboard/${projectSlug}/tasks/${task.slug}/edit`}
        className="px-4 py-1 text-base font-md rounded-lg bg-yellow-600 text-white hover:bg-yellow-500 transition"
      >
        Edit
      </Link>
      <button
        onClick={handleDelete}
        className="px-2 py-1 text-base font-md rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
      >
        Delete
      </button>
    </div>
  </div>

  <p className="mt-2 text-gray-300">{task.description}</p>

  <div className="mt-4 space-y-2">
    <p>
      <span className="font-semibold">Priority:</span>{" "}
      <span className="capitalize">{task.priority || "Not set"}</span>
    </p>
    {task.due_date && (
      <p className="text-sm text-gray-400">
        Due Date: {new Date(task.due_date).toLocaleDateString()}
      </p>
    )}
  </div>

  <div className="mt-4 align-center flex gap-2">
    <span className="font-semibold flex p-0 m-0">Status:</span>{" "}
    {statuses.map((s) => (
      <button
        key={s}
        onClick={() => handleStatusChange(s)}
        disabled={updating || task.status === s}
        className={`px-4 py-1 text-sm font-semibold rounded-lg transition ${
          task.status === s
            ? "bg-blue-600 text-white"
            : "bg-gray-700 text-gray-200 hover:bg-gray-600"
        }`}
      >
        {s}
      </button>
    ))}
  </div>

  <div className="mt-6">
    <h3 className="font-semibold mb-2">Assigned Users</h3>
    {assignees.length > 0 ? (
      <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
        {assignees.map((a) => (
          <li key={a.id} className="flex justify-between items-center">
            {a.username || "No username"}
            <button
              onClick={() => handleRemoveAssignee(a.id)}
              className="px-4 py-1 text-base font-md rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-400 text-sm">No one assigned yet.</p>
    )}

    <div className="mt-3 flex gap-2">
      <input
        type="email"
        placeholder="Enter user email"
        value={newAssigneeEmail}
        onChange={(e) => setNewAssigneeEmail(e.target.value)}
        className="flex-1 px-3 py-1 text-base rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-indigo-500"
      />
      <button
        onClick={handleAddAssignee}
        className="px-4 py-1 text-base font-md rounded-lg bg-green-600 text-white hover:bg-green-500 transition"
      >
        Add
      </button>
    </div>
  </div>

  <BackButton className="mt-4" />
</div>

  );
}
