"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface AccountUser {
  name: string;
  email: string;
  role: "admin" | "customer";
}

type AccountState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "error" }
  | { status: "ready"; user: AccountUser };

function isAccountUser(value: unknown): value is AccountUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string" &&
    "email" in value &&
    typeof value.email === "string" &&
    "role" in value &&
    (value.role === "admin" || value.role === "customer")
  );
}

export default function AccountPage() {
  const [account, setAccount] = useState<AccountState>({ status: "loading" });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) throw new Error("Account request failed");

        const data: unknown = await response.json();
        if (
          typeof data !== "object" ||
          data === null ||
          !("user" in data)
        ) {
          throw new Error("Invalid account response");
        }

        if (active) {
          if (data.user === null) setAccount({ status: "signed-out" });
          else if (isAccountUser(data.user)) setAccount({ status: "ready", user: data.user });
          else throw new Error("Invalid account data");
        }
      } catch {
        if (active) setAccount({ status: "error" });
      }
    }

    void loadAccount();
    return () => {
      active = false;
    };
  }, [retryCount]);

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white">My Account</h1>
        {account.status === "loading" ? (
          <p className="mt-6 text-[#a0a0a0]">Loading your account...</p>
        ) : account.status === "signed-out" ? (
          <div className="mt-6 rounded-md border border-[#2a2a2a] bg-[#111] p-6">
            <p className="text-[#a0a0a0]">Sign in to view your account details.</p>
            <Link href="/auth/login" className="mt-5 inline-block rounded-md bg-[#d4af37] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f]">
              Sign In
            </Link>
          </div>
        ) : account.status === "error" ? (
          <div className="mt-6 rounded-md border border-red-500/50 bg-red-500/10 p-6">
            <p role="alert" className="text-red-400">We couldn&apos;t load your account. Please try again.</p>
            <button onClick={() => { setAccount({ status: "loading" }); setRetryCount(count => count + 1); }} className="mt-5 rounded-md bg-[#d4af37] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f]">
              Try Again
            </button>
          </div>
        ) : (
          <section className="mt-6 rounded-md border border-[#2a2a2a] bg-[#111] p-6">
            <h2 className="text-lg font-semibold text-white">Account Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[#a0a0a0]">Name</dt>
                <dd className="mt-1 text-white">{account.user.name}</dd>
              </div>
              <div>
                <dt className="text-[#a0a0a0]">Email</dt>
                <dd className="mt-1 text-white">{account.user.email}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/shop" className="rounded-md bg-[#d4af37] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f]">
                Continue Shopping
              </Link>
              {account.user.role === "admin" && (
                <Link href="/admin" className="rounded-md border border-[#2a2a2a] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white hover:border-[#d4af37]">
                  Admin Dashboard
                </Link>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
