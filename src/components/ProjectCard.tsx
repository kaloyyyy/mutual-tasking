"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Project {
  id: string;
  name: string;
  description: string;
  slug: string;
}

interface ProjectCardProps {
  project: Project;
  isOwner?: boolean;
  onDelete?: (id: string) => void; // new callback
}

export default function ProjectCard({ project, isOwner, onDelete }: ProjectCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete project "${project.name}"?`)) return;

    setDeleting(true);
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    setDeleting(false);

    if (error) {
      alert("Failed to delete project: " + error.message);
      return;
    }

    // Notify parent to remove project from UI
    if (onDelete) onDelete(project.id);
  };

  const handleEdit = () => {
    router.push(`/dashboard/${project.slug}/edit`);
  };

  return (<>
      <div className="p-4 bg-gray-800 shadow hover:shadow-lg rounded-md transition relative">
      <Link href={`/dashboard/${project.slug}`} className="block">
        <h3 className="font-bold text-lg text-gray-100">{project.name}</h3>
        <p className="text-gray-300">{project.description}</p>


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
            className={`px-2 py-1 rounded text-sm text-white ${deleting ? "bg-gray-500 cursor-not-allowed" : "bg-red-600"}`}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
            </Link>
    </div>
  </>

  );
}
