import { createHash } from "node:crypto";
import { isIP } from "node:net";
import db, { lockDatabaseKey, withDatabaseContext, withDatabaseTransaction } from "@/lib/db";

type Bucket = { timestamps: number[]; failures: number; lockedUntil: number };
type StoredBucket = { key: string; timestamps: string; failures: number; lockedUntil: number };

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const LOCK_FAILURES = 5;
const LOCK_MS = 10 * 60 * 1000;
const MAX_BUCKETS = 10_000;

function persistedKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

async function getBucket(key: string): Promise<Bucket> {
  const row = await db.prepare(
    "SELECT timestamps, failures, lockedUntil FROM rate_limit_buckets WHERE key = ?",
  ).get(key) as Omit<StoredBucket, "key"> | undefined;
  if (!row) return { timestamps: [], failures: 0, lockedUntil: 0 };

  const timestamps: unknown = JSON.parse(row.timestamps);
  if (
    !Array.isArray(timestamps) ||
    !timestamps.every(timestamp => Number.isSafeInteger(timestamp) && timestamp >= 0)
  ) {
    throw new Error("Invalid persisted rate-limit bucket");
  }
  return { timestamps, failures: row.failures, lockedUntil: row.lockedUntil };
}

async function saveBucket(key: string, bucket: Bucket) {
  await db.prepare(`
    INSERT INTO rate_limit_buckets (key, timestamps, failures, lockedUntil, updatedAt)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      timestamps = excluded.timestamps,
      failures = excluded.failures,
      lockedUntil = excluded.lockedUntil,
      updatedAt = excluded.updatedAt
  `).run(key, JSON.stringify(bucket.timestamps), bucket.failures, bucket.lockedUntil, Date.now());
  await db.prepare(`
    DELETE FROM rate_limit_buckets
    WHERE key NOT IN (
      SELECT key FROM rate_limit_buckets ORDER BY updatedAt DESC LIMIT ?
    )
  `).run(MAX_BUCKETS);
}

async function cleanupExpiredBuckets() {
  await withDatabaseTransaction({ role: "system" }, async () => {
    const cutoff = Date.now() - WINDOW_MS;
    const rows = await db.prepare(
      "SELECT key, timestamps, failures, lockedUntil FROM rate_limit_buckets",
    ).all() as StoredBucket[];
    for (const row of rows) {
      await lockDatabaseKey(row.key);
      const bucket = await getBucket(row.key);
      if (bucket.lockedUntil <= Date.now()) {
        bucket.timestamps = bucket.timestamps.filter(timestamp => timestamp > cutoff);
        if (bucket.timestamps.length === 0 && bucket.failures === 0) {
          await db.prepare("DELETE FROM rate_limit_buckets WHERE key = ?").run(row.key);
        } else {
          await saveBucket(row.key, bucket);
        }
      }
    }
  });
}

setInterval(() => {
  void cleanupExpiredBuckets().catch(error => {
    console.error("[rate-limit] Failed to clean expired buckets.", error);
  });
}, 60_000).unref();

export function clientIp(req: Request): string {
  if (process.env.NODE_ENV !== "production") return "127.0.0.1";

  const ip = req.headers.get("x-real-ip")?.trim();
  if (!ip || isIP(ip) === 0) {
    throw new Error("A trusted reverse proxy must provide a valid X-Real-IP header in production.");
  }
  return ip;
}

export async function checkRateLimit(key: string): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const bucketKey = persistedKey(key);
  return withDatabaseTransaction({ role: "system" }, async () => {
    await lockDatabaseKey(bucketKey);
    const now = Date.now();
    const bucket = await getBucket(bucketKey);

    if (bucket.lockedUntil > now) {
      return { allowed: false, retryAfterSeconds: Math.ceil((bucket.lockedUntil - now) / 1000) };
    }

    bucket.timestamps = bucket.timestamps.filter(timestamp => now - timestamp < WINDOW_MS);
    if (bucket.timestamps.length >= MAX_ATTEMPTS) {
      bucket.lockedUntil = now + LOCK_MS;
      await saveBucket(bucketKey, bucket);
      return { allowed: false, retryAfterSeconds: LOCK_MS / 1000 };
    }

    bucket.timestamps.push(now);
    await saveBucket(bucketKey, bucket);
    return { allowed: true, retryAfterSeconds: 0 };
  });
}

export async function recordFailure(key: string) {
  const bucketKey = persistedKey(key);
  await withDatabaseTransaction({ role: "system" }, async () => {
    await lockDatabaseKey(bucketKey);
    const bucket = await getBucket(bucketKey);
    bucket.failures += 1;
    if (bucket.failures >= LOCK_FAILURES) {
      bucket.lockedUntil = Date.now() + LOCK_MS;
      bucket.failures = 0;
    }
    await saveBucket(bucketKey, bucket);
  });
}

export async function resetRateLimit(key: string) {
  await withDatabaseContext({ role: "system" }, () =>
    db.prepare("DELETE FROM rate_limit_buckets WHERE key = ?").run(persistedKey(key)),
  );
}
