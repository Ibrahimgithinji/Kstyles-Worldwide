"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { login, register } from "@/lib/auth-client";
import { PasswordField } from "@/components/PasswordField";

function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(searchParams.get("mode") === "register" ? "register" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [notice, setNotice] = useState<{ kind: "error" | "success"; text: string } | null>(
    searchParams.get("mode") === "reset" ? { kind: "success", text: "Your password has been reset. Sign in with your new password." } : null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNotice(null);
  }, [mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    if (mode === "register") {
      if (password !== confirm) { setNotice({ kind: "error", text: "Passwords do not match" }); return; }
      if (password.length < 8) { setNotice({ kind: "error", text: "Password must be at least 8 characters" }); return; }
    }
    setLoading(true);
    try {
      const result = mode === "login" ? await login(email, password) : await register(name, email, password);
      if (!result.ok) { setNotice({ kind: "error", text: result.error || (mode === "login" ? "Login failed" : "Registration failed") }); return; }
      setNotice({ kind: "success", text: mode === "login" ? `Welcome back, ${result.user?.name.split(" ")[0]}. Redirecting…` : `Account created, ${result.user?.name.split(" ")[0]}. Redirecting…` });
      setTimeout(() => {
        router.push(result.user?.role === "admin" ? "/admin" : "/");
        router.refresh();
      }, 700);
    } catch { setNotice({ kind: "error", text: "Something went wrong" }); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center pt-16 pb-16">
      <div className="w-full max-w-md px-4">
        <h1 className="text-3xl font-bold text-white text-center">{mode === "login" ? "Sign In" : "Create Account"}</h1>
        <p className="mt-2 text-center text-[#a0a0a0]">{mode === "login" ? "Welcome back to Kstyles." : "Join the Kstyles community."}</p>

        <div className="mt-8 grid grid-cols-2 rounded-md border border-[#2a2a2a] bg-[#111] p-1 text-sm">
          <button type="button" onClick={() => setMode("login")} className={`rounded py-2 font-semibold transition-colors ${mode === "login" ? "bg-[#d4af37] text-black" : "text-[#a0a0a0] hover:text-white"}`}>Sign In</button>
          <button type="button" onClick={() => setMode("register")} className={`rounded py-2 font-semibold transition-colors ${mode === "register" ? "bg-[#d4af37] text-black" : "text-[#a0a0a0] hover:text-white"}`}>Create Account</button>
        </div>

        {notice && (
          <p className={`mt-4 rounded-md border px-4 py-2 text-sm ${notice.kind === "error" ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-green-500/50 bg-green-500/10 text-green-400"}`}>{notice.text}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {mode === "register" && (
            <div><label className="block text-sm font-semibold text-white">Full Name</label><input required value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          )}
          <div><label className="block text-sm font-semibold text-white">Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          <PasswordField label="Password" value={password} onChange={setPassword} />
          <div className="-mt-3 text-right">
            <Link href="/auth/forgot" className="text-xs text-[#a0a0a0] hover:text-[#d4af37] transition-colors">Forgot password?</Link>
          </div>
          {mode === "register" && <PasswordField label="Confirm Password" value={confirm} onChange={setConfirm} />}
          <button type="submit" disabled={loading} className="w-full rounded-md bg-[#d4af37] py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors disabled:opacity-50">{loading ? (mode === "login" ? "Signing in..." : "Creating...") : (mode === "login" ? "Sign In" : "Create Account")}</button>
        </form>

        <p className="mt-6 text-center text-sm text-[#a0a0a0]">
          {mode === "login" ? (
            <>Don&apos;t have an account? <Link href="/auth/register" className="text-[#d4af37] hover:underline">Register</Link></>
          ) : (
            <>Already have an account? <Link href="/auth/login" className="text-[#d4af37] hover:underline">Sign In</Link></>
          )}
        </p>
        {mode === "login" && <p className="mt-4 text-center text-xs text-[#a0a0a0]">Access the members&apos; area of Kstyles Worldwide.</p>}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-[#a0a0a0]">Loading…</p></div>}>
      <AuthPage />
    </Suspense>
  );
}