import { NextRequest, NextResponse } from "next/server";
import db, { withDatabaseContext } from "@/lib/db";
import { signToken, authCookieOptions, COOKIE_NAME, isSameOriginRequest } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { clientIp, checkRateLimit } from "@/lib/rate-limit";
import { isEmail, isPassword, isStringLen } from "@/lib/validate";
import { readJson, errorResponse } from "@/lib/body";
import { emailLookup, encryptSensitiveData } from "@/lib/encryption";

export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const ip = clientIp(req);
  const key = `register:${ip}`;
  const limit = await checkRateLimit(key);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Too many registrations. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }
  let body: any;
  try {
    body = await readJson(req);
  } catch (e) {
    return errorResponse(e);
  }
  const { name, email, password } = body;
  if (!isStringLen(name, 2, 80)) return NextResponse.json({ error: "Name must be 2-80 characters" }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  if (!isPassword(password)) return NextResponse.json({ error: "Password must be 8-128 characters" }, { status: 400 });

  const lower = email.toLowerCase();
  const lookup = emailLookup(lower, "users");
  const existing = await withDatabaseContext({ role: "auth" }, () =>
    db.prepare("SELECT id FROM users WHERE email_lookup = ?").get(lookup),
  );
  if (existing) {
    return NextResponse.json({ error: "Email in use" }, { status: 400 });
  }

  const hash = await hashPassword(password);
  const id = crypto.randomUUID();
  const token = signToken({ id, email: lower, role: "customer" });
  const result = await withDatabaseContext({ role: "auth" }, () =>
    db.prepare("INSERT INTO users (id, name, email, email_lookup, password, role) VALUES (?, ?, ?, ?, ?, 'customer') ON CONFLICT(email_lookup) DO NOTHING")
      .run(id, encryptSensitiveData(name), encryptSensitiveData(lower), lookup, hash),
  );
  if (result.changes === 0) return NextResponse.json({ error: "Email in use" }, { status: 400 });
  const res = NextResponse.json({ user: { id, name, email: lower, role: "customer" } });
  res.cookies.set(COOKIE_NAME, token, authCookieOptions(60 * 60 * 24 * 7));
  return res;
}
