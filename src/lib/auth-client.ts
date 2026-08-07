"use client";
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
}
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kstyles_token");
}
export function setToken(token: string) {
  localStorage.setItem("kstyles_token", token);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("auth-updated"));
}
export function clearToken() {
  localStorage.removeItem("kstyles_token");
  if (typeof window !== "undefined") window.dispatchEvent(new Event("auth-updated"));
}
export function getAuthHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: "Bearer " + t } : {};
}
export async function fetchUser(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me", { headers: getAuthHeaders() });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}
