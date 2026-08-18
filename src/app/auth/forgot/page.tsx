"use client";
import Link from "next/link";
import { useState } from "react";
import { forgotPassword } from "@/lib/auth-client";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    setLoading(true);
    try {
      const result = await forgotPassword(email);
      if (!result.ok) { setNotice({ kind: "error", text: result.error || "Something went wrong" }); return; }
      setNotice({ kind: "success", text: result.message || "If an account exists for that email, a reset link is on its way." });
    } catch { setNotice({ kind: "error", text: "Something went wrong" }); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center pt-16 pb-16">
      <div className="w-full max-w-md px-4">
        <h1 className="text-3xl font-bold text-white text-center">Forgot Password</h1>
        <p className="mt-2 text-center text-[#a0a0a0]">Enter your account email and we&apos;ll send you a link to set a new password.</p>

        {notice && (
          <p className={`mt-4 rounded-md border px-4 py-2 text-sm ${notice.kind === "error" ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-green-500/50 bg-green-500/10 text-green-400"}`}>{notice.text}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-md bg-[#d4af37] py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors disabled:opacity-50">{loading ? "Sending..." : "Send Reset Link"}</button>
        </form>

        <p className="mt-6 text-center text-sm text-[#a0a0a0]">
          Remembered it? <Link href="/auth/login" className="text-[#d4af37] hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
