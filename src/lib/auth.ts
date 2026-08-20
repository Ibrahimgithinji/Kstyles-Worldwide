import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

// Random per-boot secret for environments without JWT_SECRET (dev only).
// Never reuse across restarts; production requires JWT_SECRET explicitly.
const DEV_FALLBACK_SECRET = crypto.randomBytes(32).toString("hex");

function getSecret(): string {
  const env = process.env.JWT_SECRET;
  if (env) return env;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "FATAL: JWT_SECRET is not set. Refusing to run in production without a secret. " +
      "Generate one with: openssl rand -base64 32"
    );
  }
  return DEV_FALLBACK_SECRET;
}

export function signToken(payload: { id: string; email: string; role: string }) {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, getSecret()) as { id: string; email: string; role: string; purpose?: string; iat?: number };
  } catch {
    return null;
  }
}

export function getAuthUser(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    const user = verifyToken(auth.slice(7));
    if (user && !user.purpose && sessionIsFresh(user)) return user;
  }
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (cookie) {
    const user = verifyToken(cookie);
    if (user && !user.purpose && sessionIsFresh(user)) return user;
  }
  return null;
}

function sessionIsFresh(user: { id: string; iat?: number }) {
  const row = db.prepare("SELECT password_changed_at FROM users WHERE id = ?").get(user.id) as { password_changed_at?: number } | undefined;
  if (!row) return false;
  return (user.iat ?? 0) >= (row.password_changed_at || 0);
}

export const RESET_TOKEN_EXPIRY_SECONDS = 60 * 30;

export function signResetToken(userId: string) {
  return jwt.sign({ id: userId, purpose: "password_reset" }, getSecret(), { expiresIn: RESET_TOKEN_EXPIRY_SECONDS });
}

export function verifyResetToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, getSecret()) as { id?: string; purpose?: string };
    if (payload?.purpose !== "password_reset" || !payload.id) return null;
    return payload.id;
  } catch {
    return null;
  }
}

export const COOKIE_NAME = "kstyles_token";

export function authCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
