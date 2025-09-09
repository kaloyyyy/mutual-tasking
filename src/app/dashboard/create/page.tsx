"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const { error } = await supabase.from("projects").insert({
      name,
      description,
      owner_id: user?.id,
    });
    if (error) alert(error.message);
    else router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Project</h2>
      <input
        type="text"
        placeholder="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded">
        Create
      </button>
    </div>
  );
}
