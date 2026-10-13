import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

// Random per-boot secret for environments without JWT_SECRET (dev only).
// Never reuse across restarts; production requires JWT_SECRET explicitly.
const DEV_FALLBACK_SECRET = crypto.randomBytes(32).toString("hex");

function getSecret(): string {
  const env = process.env.JWT_SECRET;
  if (env) {
    const isPlaceholder = /^(replace-with|your-|change-me|placeholder|example)(?:[-_]|$)/i.test(env);
    if (Buffer.byteLength(env, "utf8") < 32 || env !== env.trim() || isPlaceholder) {
      throw new Error(
        "FATAL: JWT_SECRET must be a non-placeholder value of at least 32 bytes. " +
        "Generate one with: openssl rand -base64 32"
      );
    }
    return env;
  }
  if (process.env.NODE_ENV !== "development") {
    throw new Error(
      "FATAL: JWT_SECRET is not set. Refusing to run outside development without a secret. " +
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
    if (user && !user.purpose) {
      const freshUser = getFreshSession(user);
      if (freshUser) return freshUser;
    }
  }
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (cookie) {
    const user = verifyToken(cookie);
    if (user && !user.purpose) {
      const freshUser = getFreshSession(user);
      if (freshUser) return freshUser;
    }
  }
  return null;
}

export function isSameOriginRequest(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;

  try {
    const requestOrigin = new URL(origin);
    const configuredAppUrl = process.env.APP_URL;
    let expectedOrigin: string;

    if (configuredAppUrl) {
      const appUrl = new URL(configuredAppUrl);
      if (appUrl.username || appUrl.password || (process.env.NODE_ENV === "production" && appUrl.protocol !== "https:")) {
        return false;
      }
      expectedOrigin = appUrl.origin;
    } else {
      if (process.env.NODE_ENV === "production") return false;
      const host = req.headers.get("host");
      if (!host) return false;
      expectedOrigin = new URL(`${req.nextUrl.protocol}//${host}`).origin;
    }

    return origin === requestOrigin.origin && requestOrigin.origin === expectedOrigin;
  } catch {
    return false;
  }
}

function getFreshSession(user: { id: string; email: string; iat?: number; role: string }) {
  const row = db.prepare("SELECT role, password_changed_at FROM users WHERE id = ?").get(user.id) as { role: string; password_changed_at?: number } | undefined;
  if (!row) return null;
  if ((user.iat ?? 0) < (row.password_changed_at || 0)) return null;
  return { ...user, role: row.role };
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
