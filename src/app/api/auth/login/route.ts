import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { signToken, authCookieOptions, COOKIE_NAME } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clientIp, checkRateLimit, recordAttempt, recordFailure, resetRateLimit } from "@/lib/rate-limit";
import { isEmail, isPassword } from "@/lib/validate";
import { readJson, HttpError, errorResponse } from "@/lib/body";

const DUMMY_PASSWORD_HASH = "$2b$10$7R/941SHdmY6OeTfi.z6Bub7OpBl80MieeFhcS8ly135BuZQRahgO";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const key = `login:${ip}`;
  const limit = checkRateLimit(key);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: any;
  try {
    body = await readJson(req);
  } catch (e) {
    return errorResponse(e);
  }
  const { email, password } = body;
  if (!isEmail(email) || !isPassword(password)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as any;
  const verification = await verifyPassword(password, user?.password ?? DUMMY_PASSWORD_HASH);
  if (!user || !verification.valid) {
    recordAttempt(key);
    recordFailure(key);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (verification.needsRehash) {
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(await hashPassword(password), user.id);
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  resetRateLimit(key);
  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  res.cookies.set(COOKIE_NAME, token, authCookieOptions(60 * 60 * 24 * 7));
  return res;
}
