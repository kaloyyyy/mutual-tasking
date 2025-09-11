"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // <— import at the top
import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseSession } from "@/lib/fetchSupabaseSession";

// src/types.ts
export interface Project {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  owner_id: string;
}

export default function Dashboard() {
  const router = useRouter(); // <— always call at top level
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

  // Redirect if no user (unauthorized)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/"); // redirect to login
    }
  }, [authLoading, user, router]);

  if (authLoading || loadingProjects) {
    return (
      <div className="flex justify-center items-center h-screen">Loading...</div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Link
          href="/dashboard/create"
          className="bg-green-500 text-white p-2 rounded"
        >
          + New Project
        </Link>
      </div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {projects.map((p) => (
    <ProjectCard
      key={p.id}
      project={{ ...p, description: p.description ?? "" }}
      isOwner={user?.id === p.owner_id}
      onDelete={(id) => setProjects((prev) => prev.filter((proj) => proj.id !== id))}
    />
  ))}
</div>
    </div>
  );
}
