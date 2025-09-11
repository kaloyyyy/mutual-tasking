"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    let error;

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      error = signUpError;
      if (!error) {
        alert("Sign up successful! Please check your email to confirm.");
        router.push("/dashboard");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      error = signInError;
      if (!error) {
        alert("Login successful!");
        router.push("/dashboard");
      }
    }

    if (error) alert(error.message);
  };

  return (
    <div className="flex justify-center align-center flex-col gap-2 w-80">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
      />
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
      >
        {isSignUp ? "Sign Up" : "Login"}
      </button>
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="text-sm text-blue-600 underline mt-2"
      >
        {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}
