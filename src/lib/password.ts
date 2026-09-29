import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";

function preparePassword(password: string) {
  return createHash("sha256")
    .update("kstyles:bcrypt-sha256-v1\0", "utf8")
    .update(password, "utf8")
    .digest("hex");
}

export function hashPassword(password: string) {
  return bcrypt.hash(preparePassword(password), 10).then(hash => `v1$${hash}`);
}

export async function verifyPassword(password: string, storedHash: string) {
  if (storedHash.startsWith("v1$")) {
    const valid = await bcrypt.compare(preparePassword(password), storedHash.slice(3));
    return { valid, needsRehash: false };
  }

  const valid = await bcrypt.compare(password, storedHash);
  return { valid, needsRehash: valid };
}