"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // get current session user
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      setUser(u);

      if (u) {
        // fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", u.id)
          .single();
        setUsername(profile?.username || null);
      }
    });

    // listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", u.id)
          .single();
        setUsername(profile?.username || null);
      } else {
        setUsername(null);
      }
    });

    return () => listener.subscription.unsubscribe();
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
              {username || "Profile"}
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
