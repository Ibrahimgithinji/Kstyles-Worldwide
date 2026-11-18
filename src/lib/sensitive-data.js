const { createCipheriv, createDecipheriv, createHmac, randomBytes } = require("node:crypto");

const ASSOCIATED_DATA = Buffer.from("kstyles-sensitive-data:v1", "utf8");

function getEncryptionKey() {
  const encoded = process.env.DATA_ENCRYPTION_KEY;
  if (
    typeof encoded !== "string" ||
    !/^[A-Za-z0-9+/]{43}=$/.test(encoded)
  ) {
    throw new Error(
      "DATA_ENCRYPTION_KEY must be a base64-encoded 32-byte key. Generate one with: openssl rand -base64 32",
    );
  }

  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32 || key.toString("base64") !== encoded) {
    throw new Error(
      "DATA_ENCRYPTION_KEY must be a base64-encoded 32-byte key. Generate one with: openssl rand -base64 32",
    );
  }
  return key;
}

function assertEncryptionKeyConfigured() {
  getEncryptionKey();
}

function encryptSensitiveData(value) {
  if (typeof value !== "string") {
    throw new TypeError("Sensitive data must be a string.");
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  cipher.setAAD(ASSOCIATED_DATA);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [
    "enc",
    "v1",
    cipher.getAuthTag().toString("base64url"),
    Buffer.concat([iv, ciphertext]).toString("base64url"),
  ].join(":");
}

function decryptSensitiveData(value) {
  if (value === null || value === undefined) return value;
  if (typeof value !== "string") {
    throw new TypeError("Encrypted sensitive data must be a string.");
  }
  if (!value.startsWith("enc:")) return value;

  const [prefix, version, tagEncoded, payloadEncoded, ...extra] = value.split(":");
  if (prefix !== "enc" || version !== "v1" || !tagEncoded || !payloadEncoded || extra.length > 0) {
    throw new Error("Unsupported or malformed encrypted sensitive data.");
  }

  const tag = Buffer.from(tagEncoded, "base64url");
  const payload = Buffer.from(payloadEncoded, "base64url");
  if (tag.length !== 16 || payload.length < 12) {
    throw new Error("Malformed encrypted sensitive data.");
  }

  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), payload.subarray(0, 12));
  decipher.setAAD(ASSOCIATED_DATA);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(payload.subarray(12)), decipher.final()]).toString("utf8");
}

function emailLookup(value, scope = "users") {
  if (
    typeof value !== "string" ||
    !["users", "subscribers", "forgot-rate-limit"].includes(scope)
  ) {
    throw new TypeError("Email lookup input must be a string.");
  }
  const key = createHmac("sha256", getEncryptionKey())
    .update("kstyles-email-lookup-key:v1", "utf8")
    .digest();
  return createHmac("sha256", key)
    .update(`${scope}\0${value.trim().toLowerCase()}`, "utf8")
    .digest("hex");
}

module.exports = {
  assertEncryptionKeyConfigured,
  decryptSensitiveData,
  emailLookup,
  encryptSensitiveData,
};
