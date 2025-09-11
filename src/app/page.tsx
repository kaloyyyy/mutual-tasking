"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Auth from "@/components/Auth";
import { useSupabaseSession } from "@/lib/fetchSupabaseSession";

export default function Page() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-gray-100">
        Loading... Please Wait...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 gap-6 ">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-400 text-center">
        Welcome to Mutual Tasking
      </h1>
      <p className="text-center text-gray-400 max-w-xs sm:max-w-md">
        Organize your projects, manage tasks, and collaborate seamlessly with your team.
      </p>
      <div className="w-full flex justify-center max-w-xs sm:max-w-sm">
        <Auth />
      </div>
      <p className="text-sm text-gray-500 mt-4 text-center">
        &copy; {new Date().getFullYear()} Mutual Tasking. All rights reserved.
      </p>
    </div>
  );
}
