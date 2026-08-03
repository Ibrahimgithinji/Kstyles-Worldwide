import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
export async function POST(req: NextRequest) {
  const { firstName, lastName, email, message } = await req.json();
  if (!firstName || !lastName || !email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO contacts (id, firstName, lastName, email, message) VALUES (?, ?, ?, ?, ?)").run(id, firstName, lastName, email, message);
  return NextResponse.json({ success: true, id });
}
