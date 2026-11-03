import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import db, { withDatabaseContext } from "@/lib/db";
export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return NextResponse.json({ user: null });
  const user = await withDatabaseContext(
    { userId: auth.id, role: auth.role === "admin" ? "admin" : "customer" },
    () => db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(auth.id),
  ) as any;
  return NextResponse.json({ user });
}
