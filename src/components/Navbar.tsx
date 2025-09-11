"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseSession } from "@/lib/fetchSupabaseSession";

export default function Navbar() {
  const { user, loading } = useSupabaseSession();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
      <Link
        href="/"
        className="font-bold text-2xl text-indigo-400 hover:text-indigo-300 transition"
      >
        Mutual Tasking
      </Link>

      <div className="flex gap-4 items-center">
        {loading ? (
          <span className="text-gray-100 animate-pulse">Checking session...</span>
        ) : user ? (
          <>
            <Link
              href="/dashboard"
              className="text-gray-100 hover:text-indigo-400 transition font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="text-gray-100 hover:text-indigo-400 transition font-medium"
            >
              {user.email}
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md font-medium transition"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md font-medium transition"
          >
            Login / Signup
          </Link>
        )}
      </div>
    </nav>
  );
}
