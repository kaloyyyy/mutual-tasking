"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Project {
  id: string;
  name: string;
  description: string;
  slug: string;
  // Add other fields as needed
}

export default function ProjectCard({ project, isOwner }: { project: Project; isOwner?: boolean }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete project "${project.name}"?`)) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      alert("Failed to delete project: " + error.message);
      return;
    }

    router.refresh();
  };

  const handleEdit = () => {
    router.push(`/dashboard/${project.slug}/edit`);
  };

  return (
    <div className="p-4 bg-gray-800 shadow hover:shadow-lg rounded-md transition relative">
      <Link
        href={`/dashboard/${project.slug}`}
        className="block"
      >
        <h3 className="font-bold text-lg text-gray-100">{project.name}</h3>
        <p className="text-gray-300">{project.description}</p>
      </Link>

      {isOwner && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(); }}
            className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="bg-red-600 text-white px-2 py-1 rounded text-sm"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
