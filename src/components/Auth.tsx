"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Auth() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // new username state
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

const handleSubmit = async () => {
  setLoading(true);
  setErrorMessage(null);

  try {
    if (isSignUp) {
      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      // Create a profile 1:1 with the user
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: data.user.id, // match auth user id
              username,        // from input
              email,           // new email column
            },
          ]);
        if (profileError) throw profileError;
      }

      console.log("User and profile created:", data);

    } else {
      // Login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }

    router.push("/dashboard"); // redirect after login/signup
  } catch (error: unknown) {
    if (error instanceof Error) setErrorMessage(error.message);
    else setErrorMessage("Authentication failed");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="flex justify-center flex-col gap-2 w-80">
      {errorMessage && (
        <div className="text-red-500 text-sm mb-2">{errorMessage}</div>
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
      />
      {isSignUp && (
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded"
        />
      )}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Login"}
      </button>
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="text-sm text-blue-600 underline mt-2"
      >
        {isSignUp
          ? "Already have an account? Login"
          : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}
