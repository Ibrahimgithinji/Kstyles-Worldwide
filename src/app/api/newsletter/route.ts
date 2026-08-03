import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
  try {
    db.prepare("INSERT INTO subscribers (id, email) VALUES (?, ?)").run(crypto.randomUUID(), email);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true, message: "Already subscribed" });
  }
}
