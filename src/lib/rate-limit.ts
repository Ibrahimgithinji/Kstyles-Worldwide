import { createHash } from "node:crypto";
import { isIP } from "node:net";
import db from "@/lib/db";

type Bucket = { timestamps: number[]; failures: number; lockedUntil: number };
type StoredBucket = { timestamps: string; failures: number; lockedUntil: number };

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const LOCK_FAILURES = 5;
const LOCK_MS = 10 * 60 * 1000;
const MAX_BUCKETS = 10_000;

const selectBucket = db.prepare(
  "SELECT timestamps, failures, lockedUntil FROM rate_limit_buckets WHERE key = ?"
);
const saveBucketStatement = db.prepare(`
  INSERT INTO rate_limit_buckets (key, timestamps, failures, lockedUntil, updatedAt)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET
    timestamps = excluded.timestamps,
    failures = excluded.failures,
    lockedUntil = excluded.lockedUntil,
    updatedAt = excluded.updatedAt
`);

function persistedKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function getBucket(key: string): Bucket {
  const row = selectBucket.get(key) as StoredBucket | undefined;
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

function saveBucket(key: string, bucket: Bucket) {
  saveBucketStatement.run(key, JSON.stringify(bucket.timestamps), bucket.failures, bucket.lockedUntil, Date.now());
  db.prepare(`
    DELETE FROM rate_limit_buckets
    WHERE key IN (
      SELECT key FROM rate_limit_buckets
      ORDER BY updatedAt DESC
      LIMIT -1 OFFSET ?
    )
  `).run(MAX_BUCKETS);
}

setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  const rows = db.prepare("SELECT key, timestamps, failures, lockedUntil FROM rate_limit_buckets").all() as
    (StoredBucket & { key: string })[];
  const remove = db.prepare("DELETE FROM rate_limit_buckets WHERE key = ?");
  const expire = db.transaction(() => {
    for (const row of rows) {
      const bucket = getBucket(row.key);
      if (bucket.lockedUntil <= Date.now()) {
        bucket.timestamps = bucket.timestamps.filter(timestamp => timestamp > cutoff);
        if (bucket.timestamps.length === 0 && bucket.failures === 0) remove.run(row.key);
        else saveBucket(row.key, bucket);
      }
    }
  });
  expire.immediate();
}, 60_000).unref();

export function clientIp(req: Request): string {
  if (process.env.NODE_ENV !== "production") return "127.0.0.1";

  const ip = req.headers.get("x-real-ip")?.trim();
  if (!ip || isIP(ip) === 0) {
    throw new Error("A trusted reverse proxy must provide a valid X-Real-IP header in production.");
  }
  return ip;
}

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const bucketKey = persistedKey(key);
  return db.transaction(() => {
    const now = Date.now();
    const bucket = getBucket(bucketKey);

    if (bucket.lockedUntil > now) {
      return { allowed: false, retryAfterSeconds: Math.ceil((bucket.lockedUntil - now) / 1000) };
    }

    bucket.timestamps = bucket.timestamps.filter(t => now - t < WINDOW_MS);
    if (bucket.timestamps.length >= MAX_ATTEMPTS) {
      bucket.lockedUntil = now + LOCK_MS;
      saveBucket(bucketKey, bucket);
      return { allowed: false, retryAfterSeconds: LOCK_MS / 1000 };
    }

    bucket.timestamps.push(now);
    saveBucket(bucketKey, bucket);
    return { allowed: true, retryAfterSeconds: 0 };
  }).immediate();
}

export function recordFailure(key: string) {
  const bucketKey = persistedKey(key);
  db.transaction(() => {
    const bucket = getBucket(bucketKey);
    bucket.failures += 1;
    if (bucket.failures >= LOCK_FAILURES) {
      bucket.lockedUntil = Date.now() + LOCK_MS;
      bucket.failures = 0;
    }
    saveBucket(bucketKey, bucket);
  }).immediate();
}

export function resetRateLimit(key: string) {
  db.prepare("DELETE FROM rate_limit_buckets WHERE key = ?").run(persistedKey(key));
}
