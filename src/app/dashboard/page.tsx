"use client";
import { useEffect, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

// src/types.ts
export interface Project {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  owner_id: string;
}


export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      // fetch all projects where the user is owner
      const { data: ownedProjects } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id);

      // fetch all projects where the user is a member
      const { data: memberProjects } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", user.id);

      const memberProjectIds = memberProjects?.map((m) => m.project_id) || [];

      // combine and remove duplicates
      const allProjectIds = Array.from(
        new Set([...(ownedProjects?.map((p) => p.id) || []), ...memberProjectIds])
      );

      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .in("id", allProjectIds);

      setProjects(projects || []);
    };

    if (!authLoading) fetchProjects();
  }, [user, authLoading]);

  if (authLoading)
    return (
      <div className="flex justify-center items-center h-screen">Loading...</div>
    );

  return (
    <AuthGuard>
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
          />

          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
