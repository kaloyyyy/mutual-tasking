"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseSession } from "@/lib/fetchSupabaseSession";
import { HiMenu, HiX } from "react-icons/hi";

export default function Navbar() {
  const { user, loading } = useSupabaseSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="bg-gray-800 shadow-md p-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-2xl text-indigo-400 hover:text-indigo-300 transition"
        >
          Mutual Tasking
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 items-center">
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

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-100 focus:outline-none"
          >
            {menuOpen ? <HiX size={28} /> : <HiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-2 flex flex-col gap-2 px-2">
          {loading ? (
            <span className="text-gray-100 animate-pulse">Checking session...</span>
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="block text-gray-100 hover:text-indigo-400 transition font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="block text-gray-100 hover:text-indigo-400 transition font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {user.email}
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/"
              className="block bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md font-medium transition"
              onClick={() => setMenuOpen(false)}
            >
              Login / Signup
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
