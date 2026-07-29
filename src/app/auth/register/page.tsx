"use client";
import Link from "next/link";
export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center pt-16 pb-16">
      <div className="w-full max-w-md px-4">
        <h1 className="text-3xl font-bold text-white text-center">Create Account</h1>
        <p className="mt-2 text-center text-[#a0a0a0]">Join the Kstyles community.</p>
        <form onSubmit={e => { e.preventDefault(); alert("Account created!"); }} className="mt-8 space-y-6">
          <div><label className="block text-sm font-semibold text-white">Full Name</label><input required className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          <div><label className="block text-sm font-semibold text-white">Email</label><input type="email" required className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          <div><label className="block text-sm font-semibold text-white">Password</label><input type="password" required className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          <div><label className="block text-sm font-semibold text-white">Confirm Password</label><input type="password" required className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          <button type="submit" className="w-full rounded-md bg-[#d4af37] py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors">Create Account</button>
        </form>
        <p className="mt-6 text-center text-sm text-[#a0a0a0]">Already have an account? <Link href="/auth/login" className="text-[#d4af37] hover:underline">Sign In</Link></p>
      </div>
    </div>
  );
}
