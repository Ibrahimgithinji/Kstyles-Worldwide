"use client";
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
}

export function notifyAuthChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("auth-updated"));
}

export function getAuthHeaders(): Record<string, string> {
  return {};
}

export async function fetchUser(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me");
  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string; user?: AuthUser }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, error: data.error || "Login failed" };
  notifyAuthChanged();
  return { ok: true, user: data.user };
}

export async function register(name: string, email: string, password: string): Promise<{ ok: boolean; error?: string; user?: AuthUser }> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, error: data.error || "Registration failed" };
  notifyAuthChanged();
  return { ok: true, user: data.user };
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
  notifyAuthChanged();
}
