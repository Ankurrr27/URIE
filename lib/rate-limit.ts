import { env } from "@/lib/env";
import { ApiError } from "@/lib/api-response";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store – replace Map with Redis for multi-replica deployments
const store = new Map<string, RateLimitEntry>();

// Prune expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 5 * 60 * 1_000);

export function rateLimit(key: string, max?: number, windowMs?: number) {
  const actualMax = max ?? env.RATE_LIMIT_MAX;
  const actualWindowMs = windowMs ?? env.RATE_LIMIT_WINDOW_MS;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + actualWindowMs });
    return;
  }

  entry.count++;

  if (entry.count > actualMax) {
    throw new ApiError(429, "Too many requests. Please try again later.", "TOO_MANY_REQUESTS");
  }
}
