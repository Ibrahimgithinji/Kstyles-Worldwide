type EmailMode = "log" | "resend" | "smtp";

const isProduction = process.env.NODE_ENV === "production";

export class EmailConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailConfigurationError";
  }
}

function getEmailMode(): EmailMode {
  const mode = process.env.EMAIL_MODE || (isProduction ? "" : "log");
  if (mode !== "log" && mode !== "resend" && mode !== "smtp") {
    throw new EmailConfigurationError("EMAIL_MODE must be set to resend or smtp in production.");
  }
  if (isProduction && mode === "log") {
    throw new EmailConfigurationError("EMAIL_MODE=log is not permitted in production.");
  }
  return mode;
}

function getAppUrl(): URL {
  const raw = process.env.APP_URL || (isProduction ? "" : "http://localhost:3000");
  if (!raw) throw new EmailConfigurationError("APP_URL must be set in production.");

  try {
    const url = new URL(raw);
    if (url.username || url.password || (isProduction && url.protocol !== "https:")) {
      throw new Error("unsafe URL");
    }
    return url;
  } catch {
    throw new EmailConfigurationError("APP_URL must be a valid public URL.");
  }
}

export function appUrl(path: string): string {
  if (!path.startsWith("/")) throw new EmailConfigurationError("Email links must use an absolute path.");
  return new URL(path, getAppUrl()).toString();
}

/**
 * Checks configuration before looking up an account so an unavailable mail
 * service cannot reveal whether a submitted email address belongs to a user.
 */
export function assertEmailConfigured(): void {
  const mode = getEmailMode();
  getAppUrl();
  if (mode === "resend" && !process.env.RESEND_API_KEY) {
    throw new EmailConfigurationError("RESEND_API_KEY is required when EMAIL_MODE=resend.");
  }
  if (mode === "smtp" && !process.env.SMTP_HOST) {
    throw new EmailConfigurationError("SMTP_HOST is required when EMAIL_MODE=smtp.");
  }
  if (isProduction && !process.env.EMAIL_FROM) {
    throw new EmailConfigurationError("EMAIL_FROM must be set in production.");
  }
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
  assertEmailConfigured();
  const mode = getEmailMode();
  if (mode === "log") {
    // Local-development convenience only. Production explicitly rejects this mode.
    console.log(`\n[email:${mode}] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.text}\n`);
    return;
  }
  if (mode === "resend") return sendViaResend(opts);
  return sendViaSmtp(opts);
}
