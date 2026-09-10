const APP_URL = process.env.APP_URL || "http://localhost:3000";
const EMAIL_MODE = process.env.EMAIL_MODE || "log";

export function appUrl(path: string): string {
  return `${APP_URL}${path}`;
}

async function sendViaResend(opts: { to: string; subject: string; text: string; html?: string }): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("FATAL: EMAIL_MODE=resend requires RESEND_API_KEY in .env.");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Kstyles Worldwide <onboarding@resend.dev>",
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Resend send failed (${res.status}): ${body}`);
}

async function sendViaSmtp(opts: { to: string; subject: string; text: string; html?: string }): Promise<void> {
  const host = process.env.SMTP_HOST;
  if (!host) throw new Error("FATAL: EMAIL_MODE=smtp requires SMTP_HOST in .env.");
  let createTransport: (typeof import("nodemailer"))["createTransport"];
  try {
    ({ createTransport } = await import("nodemailer"));
  } catch {
    throw new Error("FATAL: SMTP mode requires nodemailer. Run: npm install nodemailer");
  }
  const transporter = createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER || process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER ?? "", pass: process.env.SMTP_PASS ?? "" }
      : undefined,
  });
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Kstyles Worldwide" <${process.env.SMTP_USER || "no-reply@kstyles.world"}>`,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}

export async function sendEmail(opts: { to: string; subject: string; text: string; html?: string }): Promise<void> {
  if (EMAIL_MODE === "log") {
    console.log(`\n[email:${EMAIL_MODE}] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.text}\n`);
    return;
  }
  if (EMAIL_MODE === "resend") return sendViaResend(opts);
  if (EMAIL_MODE === "smtp") return sendViaSmtp(opts);
  throw new Error(`FATAL: Unknown EMAIL_MODE "${EMAIL_MODE}". Use "log" (default), "resend", or "smtp".`);
}