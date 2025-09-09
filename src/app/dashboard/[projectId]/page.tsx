"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import TaskCard from "@/components/TaskCard";
import Link from "next/link";

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.projectId!;
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchData = async () => {
    const { data: projectData } = await supabase.from("projects").select("*").eq("id", projectId).single();
    const { data: tasksData } = await supabase.from("tasks").select("*").eq("project_id", projectId);
    setProject(projectData);
    setTasks(tasksData || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!project) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{project.name}</h2>
      <p className="mb-4">{project.description}</p>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Tasks</h3>
        <Link
          href={`/dashboard/${projectId}/tasks/create`}
          className="bg-green-500 text-white p-2 rounded"
        >
          + New Task
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} projectId={projectId} />
        ))}
      </div>
    </div>
  );
}
