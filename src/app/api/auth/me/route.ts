import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import db from "@/lib/db";
export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(auth.id) as any;
  return NextResponse.json({ user });
}
