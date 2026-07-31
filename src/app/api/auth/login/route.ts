import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { signToken } from "@/lib/auth";
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
