import { describe, expect, it, vi } from "vitest";
import { createApp } from "server/services/app.js";
import { COOKIE_NAME, createAuthService } from "server/services/auth.js";
import { createDatabase } from "server/services/database.js";
import { createEmailService } from "server/services/email.js";
import { reactEmailRenderer } from "server/adapters/react-email.js";
import models from "server/models/index.js";
import { createMemoryTransport, createTestConfig, fakeHasher } from "./helpers.js";

const config = createTestConfig();
const database = createDatabase({ dialect: config.DATABASE_DIALECT, url: config.DATABASE_URL, models });
const email = createEmailService({
  renderer: reactEmailRenderer,
  transport: createMemoryTransport().transport,
  defaultFrom: config.EMAIL_FROM,
});
const auth = createAuthService({ secret: config.JWT_SECRET, secureCookies: false, hasher: fakeHasher });
const app = createApp({ config, auth, database, email });

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
      const shortApp = createApp({ config, auth: shortAuth, database, email });
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
