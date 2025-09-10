"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { generateUniqueSlug } from "@/lib/lib";

export default function CreateTask() {
  const { projectSlug } = useParams() as { projectSlug: string };
  const router = useRouter();

  const [projectId, setProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // 🔍 Fetch project ID from slug
  useEffect(() => {
    const fetchProjectId = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id")
        .eq("slug", projectSlug)
        .single();

      if (error) {
        console.error("Error fetching project:", error.message);
      } else {
        setProjectId(data.id);
      }
    };

    fetchProjectId();
  }, [projectSlug]);

  const handleSubmit = async () => {
    if (!projectId) {
      alert("Project not found");
      return;
    }

    // ✅ fetch existing task slugs for this project
    const { data: existingTasks, error: fetchError } = await supabase
      .from("tasks")
      .select("slug")
      .eq("project_id", projectId);

    if (fetchError) {
      alert(fetchError.message);
      return;
    }

    const existingSlugs = existingTasks?.map((t) => t.slug) || [];
    const slug = generateUniqueSlug(title, existingSlugs);

    const { error } = await supabase.from("tasks").insert({
      title,
      description,
      project_id: projectId,
      slug,
      due_date: dueDate || null,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push(`/dashboard/${projectSlug}`);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Task</h2>
      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded"
        disabled={!projectId || !title.trim()}
      >
        Create Task
      </button>                    
    </div>
  );
}
