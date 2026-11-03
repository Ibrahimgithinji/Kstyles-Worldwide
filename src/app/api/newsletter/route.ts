import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isEmail } from "@/lib/validate";
import { readJson, errorResponse } from "@/lib/body";
import { isSameOriginRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: any;
  try {
    body = await readJson(req);
  } catch (e) {
    return errorResponse(e);
  }
  const { email } = body;
  if (!isEmail(email)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  const result = await db.prepare("INSERT INTO subscribers (id, email) VALUES (?, ?) ON CONFLICT(email) DO NOTHING").run(crypto.randomUUID(), email.toLowerCase());
  return result.changes > 0
    ? NextResponse.json({ success: true })
    : NextResponse.json({ success: true, message: "Already subscribed" });
}
