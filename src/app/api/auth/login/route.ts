import { NextRequest, NextResponse } from "next/server";
import db, { withDatabaseContext } from "@/lib/db";
import { signToken, authCookieOptions, COOKIE_NAME, isSameOriginRequest } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clientIp, checkRateLimit, recordFailure, resetRateLimit } from "@/lib/rate-limit";
import { isEmail, isPassword } from "@/lib/validate";
import { readJson, errorResponse } from "@/lib/body";
import { decryptSensitiveData, emailLookup } from "@/lib/encryption";

const DUMMY_PASSWORD_HASH = "$2b$10$7R/941SHdmY6OeTfi.z6Bub7OpBl80MieeFhcS8ly135BuZQRahgO";

export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const ip = clientIp(req);
  const key = `login:${ip}`;
  const limit = await checkRateLimit(key);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: any;
  try {
    body = await readJson(req);
  } catch (e) {
    return errorResponse(e);
  }
  const { email, password } = body;
  if (!isEmail(email) || !isPassword(password)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  const user = await withDatabaseContext({ role: "auth" }, () =>
    db.prepare("SELECT * FROM users WHERE email_lookup = ?").get(emailLookup(email, "users")),
  ) as any;
  const verification = await verifyPassword(password, user?.password ?? DUMMY_PASSWORD_HASH);
  if (!user || !verification.valid) {
    await recordFailure(key);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  user.name = decryptSensitiveData(user.name);
  user.email = decryptSensitiveData(user.email);
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  if (verification.needsRehash) {
    const updatedPassword = await hashPassword(password);
    await withDatabaseContext({ role: "auth" }, () =>
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(updatedPassword, user.id),
    );
  }

  await resetRateLimit(key);
  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  res.cookies.set(COOKIE_NAME, token, authCookieOptions(60 * 60 * 24 * 7));
  return res;
}
