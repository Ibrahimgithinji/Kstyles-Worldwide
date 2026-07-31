"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setToken } from "@/lib/auth-client";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      setToken(data.token);
      router.push(data.user.role === "admin" ? "/admin" : "/");
      router.refresh();
    } catch { setError("Something went wrong"); }
    finally { setLoading(false); }
  }
  return (
    <div className="flex min-h-screen items-center justify-center pt-16 pb-16">
      <div className="w-full max-w-md px-4">
        <h1 className="text-3xl font-bold text-white text-center">Sign In</h1>
        <p className="mt-2 text-center text-[#a0a0a0]">Welcome back to Kstyles.</p>
        {error && <p className="mt-4 rounded-md border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div><label className="block text-sm font-semibold text-white">Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          <div><label className="block text-sm font-semibold text-white">Password</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          <button type="submit" disabled={loading} className="w-full rounded-md bg-[#d4af37] py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors disabled:opacity-50">{loading ? "Signing in..." : "Sign In"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-[#a0a0a0]">Don&apos;t have an account? <Link href="/auth/register" className="text-[#d4af37] hover:underline">Register</Link></p>
        <p className="mt-4 text-center text-xs text-[#a0a0a0]">Admin demo: admin@kstyles.com / admin123</p>
      </div>
    </div>
  );
}
