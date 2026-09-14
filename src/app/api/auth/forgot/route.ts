import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { signResetToken } from "@/lib/auth";
import { clientIp, checkRateLimit, recordAttempt } from "@/lib/rate-limit";
import { isEmail } from "@/lib/validate";
import { readJson, errorResponse } from "@/lib/body";
import { appUrl, assertEmailConfigured, EmailConfigurationError, sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  // Check this before the account lookup to avoid both reset-token logging and
  // account enumeration while production email delivery is unavailable.
  try {
    assertEmailConfigured();
  } catch (error) {
    if (error instanceof EmailConfigurationError) {
      return NextResponse.json({ error: "Password reset is temporarily unavailable. Please try again later." }, { status: 503 });
    }
    throw error;
  }

  const ip = clientIp(req);
  const ipLimit = checkRateLimit(`forgot:${ip}`);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${Math.ceil(ipLimit.retryAfterSeconds / 60)} minutes.` },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } }
    );
  }

  let body: any;
  try {
    body = await readJson(req);
  } catch (e) {
    return errorResponse(e);
  }
  const { email } = body;
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const lower = email.toLowerCase();
  const emailLimit = checkRateLimit(`forgot-email:${lower}`);
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: `Too many requests for this email. Try again in ${Math.ceil(emailLimit.retryAfterSeconds / 60)} minutes.` },
      { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSeconds) } }
    );
  }

  recordAttempt(`forgot:${ip}`);
  recordAttempt(`forgot-email:${lower}`);

  const user = db.prepare("SELECT id, name FROM users WHERE email = ?").get(lower) as { id: string; name: string } | undefined;
  if (user) {
    const token = signResetToken(user.id);
    const link = appUrl(`/auth/reset?token=${token}`);
    try {
      await sendEmail({
        to: lower,
        subject: "Kstyles Worldwide — Reset your password",
        text: `Hi ${user.name},\n\nWe received a request to reset your Kstyles password. Open the link below to choose a new one. It expires in 30 minutes.\n\n${link}\n\nIf you didn't request this, you can safely ignore this email.\n\n— Kstyles Worldwide`,
        html: `<p>Hi ${user.name},</p><p>We received a request to reset your Kstyles password. <a href="${link}">Click here to choose a new one</a>. It expires in 30 minutes.</p><p>If you didn't request this, you can safely ignore this email.</p>`,
      });
    } catch {
      // Do not write the reset link or provider response to logs. Keep the
      // public response generic so delivery failures do not reveal accounts.
      console.error("[password-reset] Email delivery failed.");
    }
  }

  return NextResponse.json({ message: "If an account exists for that email, a reset link is on its way." });
}
