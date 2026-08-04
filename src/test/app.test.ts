import { describe, expect, it, vi } from "vitest";
import { createApp } from "server/services/app.js";
import { COOKIE_NAME, createAuthService } from "server/services/auth.js";
import { createDatabase } from "server/services/database.js";
import { createEmailService } from "server/services/email.js";
import { createRateLimiter } from "server/services/rate-limiter.js";
import { reactEmailRenderer } from "server/adapters/react-email.js";
import { createMemoryRateLimitStore } from "server/adapters/memory.js";
import models from "server/models/index.js";
import { createMemoryLogger, createMemoryTransport, createTestConfig, fakeHasher } from "./helpers.js";

const config = createTestConfig();
const database = createDatabase({ dialect: config.DATABASE_DIALECT, url: config.DATABASE_URL, models });
const services = {
  config,
  database,
  email: createEmailService({
    renderer: reactEmailRenderer,
    transport: createMemoryTransport().transport,
    defaultFrom: config.EMAIL_FROM,
  }),
  logger: createMemoryLogger().logger,
  rateLimiter: createRateLimiter({ store: createMemoryRateLimitStore() }),
};
const auth = createAuthService({ secret: config.JWT_SECRET, secureCookies: false, hasher: fakeHasher });
const app = createApp({ ...services, auth });

describe("app", () => {
  it("rejects private procedures without a session cookie", async () => {
    const res = await app.request("/trpc/me");
    expect(res.status).toBe(401);
  });

  it("resolves the user from the session cookie", async () => {
    const token = await auth.sign({ id: 1, email: "user@example.com" });
    const res = await app.request("/trpc/me", { headers: { cookie: `${COOKIE_NAME}=${token}` } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result.data).toEqual({ id: 1, email: "user@example.com" });
  });

  it("treats an invalid session cookie as unauthenticated", async () => {
    const res = await app.request("/trpc/me", { headers: { cookie: `${COOKIE_NAME}=garbage` } });
    expect(res.status).toBe(401);
  });

  it("rejects the session cookie once the session ttl has elapsed", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      const shortAuth = createAuthService({
        secret: config.JWT_SECRET,
        secureCookies: false,
        hasher: fakeHasher,
        sessionTtl: 1,
      });
      const shortApp = createApp({ ...services, auth: shortAuth });
      const headers = { cookie: `${COOKIE_NAME}=${await shortAuth.sign({ id: 1, email: "user@example.com" })}` };
      const before = await shortApp.request("/trpc/me", { headers });
      expect(before.status).toBe(200);
      vi.advanceTimersByTime(2000);
      const after = await shortApp.request("/trpc/me", { headers });
      expect(after.status).toBe(401);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("health", () => {
  it("reports ok when the database responds", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("reports unavailable when the database does not respond", async () => {
    const query = vi.spyOn(database, "query").mockRejectedValueOnce(new Error("connection lost"));
    const res = await app.request("/api/health");
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ status: "unavailable" });
    query.mockRestore();
  });
});
