"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
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
              Profile
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
