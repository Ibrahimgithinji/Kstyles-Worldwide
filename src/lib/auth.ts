import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const SECRET = process.env.JWT_SECRET || "kstyles-dev-secret-2025";

export function signToken(payload: { id: string; email: string; role: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function getAuthUser(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return verifyToken(auth.slice(7));
}