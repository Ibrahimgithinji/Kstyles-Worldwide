import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isEmail } from "@/lib/validate";
import { readJson, errorResponse } from "@/lib/body";
import { isSameOriginRequest } from "@/lib/auth";
import { emailLookup, encryptSensitiveData } from "@/lib/encryption";

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
  const normalizedEmail = email.toLowerCase();
  const result = await db.prepare("INSERT INTO subscribers (id, email, email_lookup) VALUES (?, ?, ?) ON CONFLICT(email_lookup) DO NOTHING")
    .run(crypto.randomUUID(), encryptSensitiveData(normalizedEmail), emailLookup(normalizedEmail, "subscribers"));
  return result.changes > 0
    ? NextResponse.json({ success: true })
    : NextResponse.json({ success: true, message: "Already subscribed" });
}
