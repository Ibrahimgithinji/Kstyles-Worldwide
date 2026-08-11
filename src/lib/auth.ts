import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const DEV_FALLBACK_SECRET = "kstyles-dev-secret-2025";

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
    return jwt.verify(token, getSecret()) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function getAuthUser(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return verifyToken(auth.slice(7));
}
