import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { signToken } from "@/lib/auth";
export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return NextResponse.json({ error: "Email in use" }, { status: 400 });
  const hash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'customer')").run(id, name, email, hash);
  const token = signToken({ id, email, role: "customer" });
  return NextResponse.json({ token, user: { id, name, email, role: "customer" } });
}
