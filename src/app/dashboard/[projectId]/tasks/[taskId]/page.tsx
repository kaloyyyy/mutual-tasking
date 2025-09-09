"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TaskPage() {
  const { projectId, taskId } = useParams();
  const router = useRouter();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;

      // Fetch task with projectId for extra safety
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .eq("project_id", projectId)
        .single();

      if (error) {
        console.error("Error fetching task:", error.message);
        setError("Task not found or you don't have access.");
        setTask(null);
      } else {
        setTask(data);
        setError(null);
      }
      setLoading(false);
    };

    fetchTask();
  }, [projectId, taskId]);

  if (loading) return <div>Loading task...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="p-6 bg-gray-800 text-gray-100 rounded-md shadow-md max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
      <p className="mb-2">{task.description}</p>
      <p className="text-gray-400 mb-4">Status: {task.status}</p>
      <p className="text-gray-400 text-sm">Project ID: {task.project_id}</p>
    </div>
  );
}
