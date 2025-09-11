"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User, Session } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get current session user
    supabase.auth.getSession().then(async ({ data: sessionData }) => {
      const u = sessionData.session?.user ?? null;
      setUser(u);

      if (u) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", u.id)
          .single();
        setUsername(profileData?.username ?? null);
      }
    });

    // Listen to auth changes
    const { data } = supabase.auth.onAuthStateChange(async (_event, session: Session | null) => {
      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", u.id)
          .single();
        setUsername(profileData?.username ?? null);
      } else {
        setUsername(null);
      }
    });

    // Properly unsubscribe
    return () => data.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
      <Link href="/" className="font-bold text-2xl text-indigo-400 hover:text-indigo-300 transition">
        Mutual Tasking
      </Link>
      <div className="flex gap-4 items-center">
        {user ? (
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
              {username ?? "Profile"}
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
