import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { signToken } from "@/lib/auth";
import { clientIp, checkRateLimit, recordAttempt } from "@/lib/rate-limit";

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
  if (!name || !email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(String(email).toLowerCase());
  if (existing) {
    recordAttempt(key);
    return NextResponse.json({ error: "Email in use" }, { status: 400 });
  }

  const hash = await bcrypt.hash(String(password), 10);
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'customer')")
    .run(id, String(name).slice(0, 80), String(email).toLowerCase(), hash);
  const token = signToken({ id, email: String(email).toLowerCase(), role: "customer" });
  return NextResponse.json({ token, user: { id, name: String(name).slice(0, 80), email: String(email).toLowerCase(), role: "customer" } });
}
