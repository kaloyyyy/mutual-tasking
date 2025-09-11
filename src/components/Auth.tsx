"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Auth() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([{ id: data.user.id, username, email }]);
          if (profileError) throw profileError;
        }

        console.log("User and profile created:", data);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      router.push("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) setErrorMessage(error.message);
      else setErrorMessage("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs sm:max-w-sm md:max-w-md">
      {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-full"
      />

      {isSignUp && (
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded w-full"
        />
      )}

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition"
        disabled={loading}
      >
        {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Login"}
      </button>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="text-sm text-blue-600 underline mt-2 self-center"
      >
        {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}
