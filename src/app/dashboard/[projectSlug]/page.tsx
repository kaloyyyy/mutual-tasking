"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import TaskCard from "@/components/TaskCard";
import Link from "next/link";

export default function ProjectDetail() {
  const params = useParams();
  const projectSlug = params.projectSlug as string; // now we're using slug
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchData = async () => {
    // fetch project by slug
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", projectSlug)
      .single();

    if (projectError) {
      console.error("Error fetching project:", projectError.message);
      return;
    }

    if (projectData) {
      setProject(projectData);

      // fetch tasks by project id
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectData.id);

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError.message);
      }

      setTasks(tasksData || []);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectSlug]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} projectSlug={project.slug} />
        ))}
      </div>
    </div>
  );
}
