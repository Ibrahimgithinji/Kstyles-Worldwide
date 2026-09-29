import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import db from "@/lib/db";
import { verifyResetToken } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { clientIp, checkRateLimit, recordAttempt } from "@/lib/rate-limit";
import { isPassword } from "@/lib/validate";
import { readJson, errorResponse } from "@/lib/body";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limit = checkRateLimit(`reset:${ip}`);
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
  const { token, password } = body;
  if (typeof token !== "string" || !isPassword(password)) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  const userId = verifyResetToken(token);
  if (!userId) {
    recordAttempt(`reset:${ip}`);
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  const hash = await hashPassword(password);
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const result = db.prepare(`
    UPDATE users
    SET password = ?, password_changed_at = ?, reset_token_hash = NULL, reset_token_expires_at = NULL
    WHERE id = ? AND reset_token_hash = ? AND reset_token_expires_at > ?
  `).run(hash, Math.floor(Date.now() / 1000), userId, tokenHash, Date.now());
  if (result.changes === 0) {
    recordAttempt(`reset:${ip}`);
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  return NextResponse.json({ message: "Password updated. You can now sign in with your new password." });
}
