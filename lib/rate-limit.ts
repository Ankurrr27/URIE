import { ApiError } from "@/lib/api-response";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit = Number(process.env.RATE_LIMIT_MAX ?? 80), windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000)) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (bucket.count >= limit) {
    throw new ApiError(429, "Too many requests. Please slow down.", "RATE_LIMITED");
  }

  bucket.count += 1;
}
