"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { generateUniqueSlug } from "@/lib/lib";
import { useSupabaseSession } from "@/lib/fetchSupabaseSession";

export default function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseSession();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/"); // redirect unauthorized users
    }
  }, [authLoading, user, router]);

  const handleSubmit = async () => {
    if (!user) {
      alert("You must be logged in to create a project.");
      return;
    }

    // Fetch existing project slugs to ensure uniqueness
    const { data: existingProjects } = await supabase
      .from("projects")
      .select("slug");
    const existingSlugs = existingProjects?.map((p) => p.slug) || [];

    const slug = generateUniqueSlug(name, existingSlugs);

    // Insert new project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name,
        description,
        slug,
        owner_id: user.id,
      })
      .select("id, slug")
      .single();

    if (projectError || !project) {
      alert(projectError?.message || "Failed to create project.");
      return;
    }

    // Automatically add owner as a member
    const { error: memberError } = await supabase.from("project_members").insert({
      project_id: project.id,
      user_id: user.id,
      role: "owner",
    });

    if (memberError) {
      console.error("Failed to assign owner as member:", memberError.message);
    }

    router.push(`/dashboard/${project.slug}`);
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

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
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded"
        disabled={!name.trim()}
      >
        Create
      </button>
    </div>
  );
}
