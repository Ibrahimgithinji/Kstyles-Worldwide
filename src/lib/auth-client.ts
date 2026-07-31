"use client";
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kstyles_token");
}
export function setToken(token: string) {
  localStorage.setItem("kstyles_token", token);
}
export function clearToken() {
  localStorage.removeItem("kstyles_token");
}
export function getAuthHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: "Bearer " + t } : {};
}
