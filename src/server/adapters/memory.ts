import type { RateLimitStore } from "server/services/rate-limiter.js";

const MAX_KEYS = 10_000; // sweep expired windows above this size to bound memory

export function createMemoryRateLimitStore(): RateLimitStore {
  const windows = new Map<string, { count: number; resetAt: number }>();
  return {
    async increment(key, windowMs) {
      const now = Date.now();
      if (windows.size >= MAX_KEYS) {
        for (const [existingKey, existing] of windows) {
          if (existing.resetAt <= now) {
            windows.delete(existingKey);
          }
        }
      }
      const entry = windows.get(key);
      if (entry === undefined || entry.resetAt <= now) {
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return 1;
      }
      entry.count += 1;
      return entry.count;
    },
  };
}
