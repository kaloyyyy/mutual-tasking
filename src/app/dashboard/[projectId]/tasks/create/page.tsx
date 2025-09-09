"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";

export default function CreateTask() {
  const params = useParams();
  const projectId = params.projectId!;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async () => {
    const { error } = await supabase.from("tasks").insert({
      title,
      description,
      project_id: projectId,
      due_date: dueDate,
    });
    if (error) alert(error.message);
    else router.push(`/dashboard/${projectId}`);
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
      <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded">
        Create Task
      </button>
    </div>
  );
}
