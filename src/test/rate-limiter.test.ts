import { afterEach, describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "server/services/rate-limiter.js";
import { createMemoryRateLimitStore } from "server/adapters/memory.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("rate limiter", () => {
  it("allows requests up to the limit and blocks the rest", async () => {
    const limiter = createRateLimiter({ store: createMemoryRateLimitStore() });
    const options = { max: 3, windowMs: 60_000 };
    expect(await limiter.limit("key", options)).toBe(true);
    expect(await limiter.limit("key", options)).toBe(true);
    expect(await limiter.limit("key", options)).toBe(true);
    expect(await limiter.limit("key", options)).toBe(false);
  });

  it("tracks keys independently", async () => {
    const limiter = createRateLimiter({ store: createMemoryRateLimitStore() });
    const options = { max: 1, windowMs: 60_000 };
    expect(await limiter.limit("a", options)).toBe(true);
    expect(await limiter.limit("b", options)).toBe(true);
    expect(await limiter.limit("a", options)).toBe(false);
  });

  it("resets once the window has elapsed", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const limiter = createRateLimiter({ store: createMemoryRateLimitStore() });
    const options = { max: 1, windowMs: 60_000 };
    expect(await limiter.limit("key", options)).toBe(true);
    expect(await limiter.limit("key", options)).toBe(false);
    vi.advanceTimersByTime(60_001);
    expect(await limiter.limit("key", options)).toBe(true);
  });
});
