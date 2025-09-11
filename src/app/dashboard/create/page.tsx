"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { generateUniqueSlug } from "@/lib/lib";
import { useSupabaseSession } from "@/lib/fetchSupabaseSession";
import BackButton from "@/components/BackButton";

export default function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
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

    setLoading(true);

    // Fetch existing slugs
    const { data: existingProjects } = await supabase.from("projects").select("slug");
    const existingSlugs = existingProjects?.map((p) => p.slug) || [];

    const slug = generateUniqueSlug(name, existingSlugs);

    // Insert new project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({ name, description, slug, owner_id: user.id })
      .select("id, slug")
      .single();

    if (projectError || !project) {
      alert(projectError?.message || "Failed to create project.");
      setLoading(false);
      return;
    }

    // Add owner as member
    const { error: memberError } = await supabase
      .from("project_members")
      .insert({ project_id: project.id, user_id: user.id, role: "owner" });

    if (memberError) {
      console.error("Failed to assign owner as member:", memberError.message);
    }

    router.push(`/dashboard/${project.slug}`);
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6 lg:p-8 bg-gray-900 rounded-md shadow-md min-h-[60vh] text-gray-100">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Create Project</h2>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-700 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 text-gray-100"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-700 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 text-gray-100 resize-none"
          rows={4}
        />
        <button
          onClick={handleSubmit}
          className={`bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-md font-medium transition ${
            !name.trim() || loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={!name.trim() || loading}
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </div>
        <BackButton className="mt-4" />
    </div>
  );
}
