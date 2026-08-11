import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isEmail } from "@/lib/validate";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!isEmail(email)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  try {
    db.prepare("INSERT INTO subscribers (id, email) VALUES (?, ?)").run(crypto.randomUUID(), email.toLowerCase());
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true, message: "Already subscribed" });
  }
}
