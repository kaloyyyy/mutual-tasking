"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseSession } from "@/lib/fetchSupabaseSession";

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  owner_id: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      const { data: ownedProjects } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id);

      const { data: memberProjects } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", user.id);

      const memberProjectIds = memberProjects?.map((m) => m.project_id) || [];
      const allProjectIds = Array.from(
        new Set([...(ownedProjects?.map((p) => p.id) || []), ...memberProjectIds])
      );

      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .in("id", allProjectIds);

      setProjects(projects || []);
      setLoadingProjects(false);
    };

    if (!authLoading) fetchProjects();
  }, [user, authLoading]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  if (authLoading || loadingProjects) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-medium text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold">Projects</h2>
        <Link
          href="/dashboard/create"
          className="bg-green-500 hover:bg-green-600 text-white font-medium text-sm px-4 py-2 rounded transition-colors"
        >
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-400 text-base">You have no projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={{ ...p, description: p.description ?? "" }}
              isOwner={user?.id === p.owner_id}
              onDelete={(id) =>
                setProjects((prev) => prev.filter((proj) => proj.id !== id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
