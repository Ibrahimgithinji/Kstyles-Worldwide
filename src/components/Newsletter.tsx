"use client";
import { useState } from "react";
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (res.ok) { setStatus("success"); setEmail(""); } else setStatus("error");
    } catch { setStatus("error"); }
  }
  return (
    <section className="bg-[#111] py-24">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold text-white">Stay in the Loop</h2>
        <p className="mt-2 text-[#a0a0a0]">Be the first to know about drops, restocks, and exclusive offers.</p>
        {status === "success" && <p className="mt-4 text-sm text-green-400">Subscribed! Welcome to the Kstyles community.</p>}
        {status === "error" && <p className="mt-4 text-sm text-red-400">Something went wrong. Try again.</p>}
        <form onSubmit={handleSubmit} className="mt-8 flex gap-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="flex-1 rounded-md border border-[#2a2a2a] bg-black px-4 py-3 text-sm text-white placeholder-[#a0a0a0] focus:border-[#d4af37] focus:outline-none" required />
          <button type="submit" disabled={status === "loading"} className="rounded-md bg-[#d4af37] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors disabled:opacity-50">{status === "loading" ? "..." : "Subscribe"}</button>
        </form>
      </div>
    </section>
  );
}
