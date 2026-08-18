const APP_URL = process.env.APP_URL || "http://localhost:3000";
const EMAIL_MODE = process.env.EMAIL_MODE || "log";

export function appUrl(path: string): string {
  return `${APP_URL}${path}`;
}

export async function sendEmail(opts: { to: string; subject: string; text: string; html?: string }): Promise<void> {
  if (EMAIL_MODE === "log") {
    console.log(`\n[email:${EMAIL_MODE}] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.text}\n`);
    return;
  }
  if (EMAIL_MODE === "resend" || EMAIL_MODE === "smtp") {
    throw new Error(
      `FATAL: EMAIL_MODE="${EMAIL_MODE}" is not configured yet. Set the provider credentials in .env, or remove EMAIL_MODE to fall back to console logging.`
    );
  }
  throw new Error(`FATAL: Unknown EMAIL_MODE "${EMAIL_MODE}". Use "log" (default), or configure a provider.`);
}
