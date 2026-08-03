"use client";
import { useState } from "react";
export default function ContactPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { setStatus("success"); setForm({ firstName: "", lastName: "", email: "", message: "" }); }
      else setStatus("error");
    } catch { setStatus("error"); }
  }
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white">Contact</h1>
        <p className="mt-2 text-[#a0a0a0]">Get in touch with the Kstyles team.</p>
        {status === "success" && <p className="mt-6 rounded-md border border-green-500/50 bg-green-500/10 px-4 py-2 text-sm text-green-400">Message sent! We&apos;ll get back to you soon.</p>}
        {status === "error" && <p className="mt-6 rounded-md border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400">Failed to send. Please try again.</p>}
        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="block text-sm font-semibold text-white">First Name</label><input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
            <div><label className="block text-sm font-semibold text-white">Last Name</label><input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-white">Email</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          <div><label className="block text-sm font-semibold text-white">Message</label><textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          <button type="submit" disabled={status === "loading"} className="rounded-md bg-[#d4af37] px-8 py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors disabled:opacity-50">{status === "loading" ? "Sending..." : "Send Message"}</button>
        </form>
      </div>
    </div>
  );
}
