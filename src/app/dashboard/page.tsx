"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .then(({ data }) => setProjects(data || []));
  }, []);

  return (
    <AuthGuard>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Projects</h2>
          <Link href="/dashboard/create" className="bg-green-500 text-white p-2 rounded">
            + New Project
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
