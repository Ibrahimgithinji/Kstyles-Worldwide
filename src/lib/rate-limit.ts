type Bucket = { timestamps: number[]; failures: number; lockedUntil: number };

const store = new Map<string, Bucket>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const LOCK_FAILURES = 5;
const LOCK_MS = 10 * 60 * 1000;
const MAX_BUCKETS = 10_000;

setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [key, bucket] of store) {
    if (bucket.lockedUntil > Date.now()) continue;
    bucket.timestamps = bucket.timestamps.filter(t => t > cutoff);
    if (bucket.timestamps.length === 0 && bucket.failures === 0) store.delete(key);
  }
}, 60_000).unref();

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf;
  return req.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = store.get(key) ?? { timestamps: [], failures: 0, lockedUntil: 0 };

  if (bucket.lockedUntil > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.lockedUntil - now) / 1000) };
  }

  bucket.timestamps = bucket.timestamps.filter(t => now - t < WINDOW_MS);
  if (bucket.timestamps.length >= MAX_ATTEMPTS) {
    bucket.lockedUntil = now + LOCK_MS;
    store.set(key, bucket);
    return { allowed: false, retryAfterSeconds: LOCK_MS / 1000 };
  }

  store.set(key, bucket);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordFailure(key: string) {
  const now = Date.now();
  const bucket = store.get(key) ?? { timestamps: [], failures: 0, lockedUntil: 0 };
  bucket.failures += 1;
  if (bucket.failures >= LOCK_FAILURES) {
    bucket.lockedUntil = now + LOCK_MS;
    bucket.failures = 0;
  }
  store.set(key, bucket);
}

export function recordAttempt(key: string) {
  const bucket = store.get(key) ?? { timestamps: [], failures: 0, lockedUntil: 0 };
  bucket.timestamps.push(Date.now());
  if (store.size > MAX_BUCKETS) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.set(key, bucket);
}

export function resetRateLimit(key: string) {
  store.delete(key);
}
