export type RateLimitStore = {
  increment(key: string, windowMs: number): Promise<number>;
};

export type RateLimitOptions = {
  max: number;
  windowMs: number;
};

export type RateLimiterOptions = {
  store: RateLimitStore;
};

export type RateLimiterService = ReturnType<typeof createRateLimiter>;

export function createRateLimiter(options: RateLimiterOptions) {
  return {
    async limit(key: string, limitOptions: RateLimitOptions) {
      const count = await options.store.increment(key, limitOptions.windowMs);
      return count <= limitOptions.max;
    },
  };
}
