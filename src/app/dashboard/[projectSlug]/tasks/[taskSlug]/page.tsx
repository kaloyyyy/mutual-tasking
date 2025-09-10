"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";

export default function TaskPage() {
  const { projectSlug, taskSlug } = useParams() as {
    projectSlug: string;
    taskSlug: string;
  };

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("slug", projectSlug)
        .single();

      if (project) {
        const { data: task } = await supabase
          .from("tasks")
          .select("*")
          .eq("slug", taskSlug)
          .eq("project_id", project.id)
          .single();

        setTask(task);
      }
      setLoading(false);
    };

    fetchData();
  }, [projectSlug, taskSlug]);

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;
    setUpdating(true);

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", task.id);

    if (!error) {
      setTask({ ...task, status: newStatus });
    } else {
      console.error(error);
      alert("Failed to update status");
    }

    setUpdating(false);
  };

  if (loading) return <div className="p-4 text-gray-400">Loading...</div>;
  if (!task) return <div className="p-4 text-red-400">Task not found</div>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-3xl font-bold">{task.title}</h1>
      <p className="mt-2 text-gray-400">{task.description}</p>

      <div className="mt-4">
        <p>
          <span className="font-semibold">Status:</span>{" "}
          <span className="capitalize">{task.status}</span>
        </p>

        <div className="mt-2 flex gap-2">
          {["todo", "in-progress", "done"].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={updating || task.status === s}
              className={`px-3 py-1 rounded text-sm ${
                task.status === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {task.due_date && (
        <p className="mt-4 text-sm text-gray-500">
          Due Date: {new Date(task.due_date).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
