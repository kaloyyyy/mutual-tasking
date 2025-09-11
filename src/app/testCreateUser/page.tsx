"use client";
import { useState } from "react";

export default function TestCreateUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<string>("");

  const handleCreateUser = async () => {
    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password123", username: "testuser" }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert("Error: " + data.error);
    } else {
      alert("User created successfully!");
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 gap-4 p-4">
      <h1 className="text-2xl font-bold mb-4">Test Create User</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-80"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded w-80"
      />
      <button
        onClick={handleCreateUser}
        className="bg-blue-500 text-white p-2 rounded w-80"
      >
        Create User
      </button>
      {result && <p className="mt-2">{result}</p>}
    </div>
  );
}
