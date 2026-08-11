import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { signToken, authCookieOptions, COOKIE_NAME } from "@/lib/auth";
import { clientIp, checkRateLimit, recordAttempt } from "@/lib/rate-limit";
import { isEmail, isPassword, isStringLen } from "@/lib/validate";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const key = `register:${ip}`;
  const limit = checkRateLimit(key);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Too many registrations. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const { name, email, password } = await req.json();
  if (!isStringLen(name, 2, 80)) return NextResponse.json({ error: "Name must be 2-80 characters" }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  if (!isPassword(password)) return NextResponse.json({ error: "Password must be 8-128 characters" }, { status: 400 });

  const lower = email.toLowerCase();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(lower);
  if (existing) {
    recordAttempt(key);
    return NextResponse.json({ error: "Email in use" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'customer')")
    .run(id, name, lower, hash);
  const token = signToken({ id, email: lower, role: "customer" });
  const res = NextResponse.json({ user: { id, name, email: lower, role: "customer" } });
  res.cookies.set(COOKIE_NAME, token, authCookieOptions(60 * 60 * 24 * 7));
  return res;
}
