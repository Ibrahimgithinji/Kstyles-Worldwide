import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isEmail, isStringLen } from "@/lib/validate";
import { readJson, errorResponse } from "@/lib/body";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await readJson(req);
  } catch (e) {
    return errorResponse(e);
  }
  const { firstName, lastName, email, message } = body;
  if (!isStringLen(firstName, 1, 80)) return NextResponse.json({ error: "Invalid first name" }, { status: 400 });
  if (!isStringLen(lastName, 1, 80)) return NextResponse.json({ error: "Invalid last name" }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  if (!isStringLen(message, 5, 5000)) return NextResponse.json({ error: "Message must be 5-5000 characters" }, { status: 400 });

  const id = crypto.randomUUID();
  db.prepare("INSERT INTO contacts (id, firstName, lastName, email, message) VALUES (?, ?, ?, ?, ?)").run(id, firstName, lastName, email.toLowerCase(), message);
  return NextResponse.json({ success: true, id });
}
