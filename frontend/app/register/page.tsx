"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Registration failed");
      }
      // After signup, sign in with credentials
      const signin = await signIn("credentials", { redirect: false, email, password });
      if (signin?.ok) {
        window.location.href = "/games";
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create an account</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              type="text"
              className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-900"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={loading}
            className="w-full rounded-md bg-emerald-600 text-white py-2 hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="text-sm mt-4 text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <Link className="text-emerald-600 hover:underline" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
