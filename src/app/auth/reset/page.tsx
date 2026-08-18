"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PasswordField } from "@/components/PasswordField";
import { resetPassword } from "@/lib/auth-client";

function ResetInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [notice, setNotice] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16 pb-16">
        <div className="w-full max-w-md px-4 text-center">
          <h1 className="text-3xl font-bold text-white">Invalid Link</h1>
          <p className="mt-2 text-[#a0a0a0]">This reset link is missing or malformed. Request a new one.</p>
          <Link href="/auth/forgot" className="mt-6 inline-block rounded-md bg-[#d4af37] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors">Request New Link</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    if (password.length < 8) { setNotice({ kind: "error", text: "Password must be at least 8 characters" }); return; }
    if (password !== confirm) { setNotice({ kind: "error", text: "Passwords do not match" }); return; }
    setLoading(true);
    try {
      const result = await resetPassword(token, password);
      if (!result.ok) { setNotice({ kind: "error", text: result.error || "Something went wrong" }); return; }
      setNotice({ kind: "success", text: "Your password has been reset. Redirecting to sign in…" });
      setTimeout(() => {
        router.push("/auth/login?mode=reset");
      }, 700);
    } catch { setNotice({ kind: "error", text: "Something went wrong" }); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center pt-16 pb-16">
      <div className="w-full max-w-md px-4">
        <h1 className="text-3xl font-bold text-white text-center">Set New Password</h1>
        <p className="mt-2 text-center text-[#a0a0a0]">Choose a new password for your account.</p>

        {notice && (
          <p className={`mt-4 rounded-md border px-4 py-2 text-sm ${notice.kind === "error" ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-green-500/50 bg-green-500/10 text-green-400"}`}>{notice.text}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <PasswordField label="New Password" value={password} onChange={setPassword} placeholder="At least 8 characters" />
          <PasswordField label="Confirm New Password" value={confirm} onChange={setConfirm} />
          <button type="submit" disabled={loading} className="w-full rounded-md bg-[#d4af37] py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors disabled:opacity-50">{loading ? "Resetting..." : "Reset Password"}</button>
        </form>

        <p className="mt-6 text-center text-sm text-[#a0a0a0]">
          <Link href="/auth/login" className="text-[#d4af37] hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-[#a0a0a0]">Loading…</p></div>}>
      <ResetInner />
    </Suspense>
  );
}
