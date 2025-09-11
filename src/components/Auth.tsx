"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Auth() {
  const { signIn, signUp, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (isSignUp) {
      await signUp(email, password);
      router.push("/dashboard");
    } else {
      await signIn(email, password);
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex justify-center flex-col gap-2 w-80">
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
        disabled={loading}
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
