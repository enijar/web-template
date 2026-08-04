import { beforeAll, describe, expect, it, vi } from "vitest";
import trpc from "server/services/trpc.js";
import router from "server/router.js";
import type { AppContext } from "server/services/app.js";
import { createAuthService } from "server/services/auth.js";
import { createDatabase } from "server/services/database.js";
import { createEmailService } from "server/services/email.js";
import { createRateLimiter } from "server/services/rate-limiter.js";
import { reactEmailRenderer } from "server/adapters/react-email.js";
import { createMemoryRateLimitStore } from "server/adapters/memory.js";
import models from "server/models/index.js";
import User from "server/models/user.js";
import { createMemoryLogger, createMemoryTransport, createTestConfig, fakeHasher, formData } from "./helpers.js";

const config = createTestConfig();
const database = createDatabase({ dialect: config.DATABASE_DIALECT, url: config.DATABASE_URL, models });
const auth = createAuthService({ secret: config.JWT_SECRET, secureCookies: false, hasher: fakeHasher });
const { messages, transport } = createMemoryTransport();
const email = createEmailService({ renderer: reactEmailRenderer, transport, defaultFrom: config.EMAIL_FROM });

const createCaller = trpc.createCallerFactory(router);

function createContext(user: AppContext["user"] = null, overrides: Partial<AppContext> = {}) {
  const resHeaders = new Headers();
  const caller = createCaller({
    config,
    auth,
    database,
    email,
    logger: createMemoryLogger().logger,
    rateLimiter: createRateLimiter({ store: createMemoryRateLimitStore() }),
    resHeaders,
    user,
    ...overrides,
  });
  return { caller, resHeaders };
}

beforeAll(async () => {
  await database.sync();
  await User.create({ email: "user@example.com", password: await fakeHasher.hash("password123") });
});

describe("login", () => {
  it("sets a session cookie and returns the user", async () => {
    const { caller, resHeaders } = createContext();
    const user = await caller.login(formData({ email: "user@example.com", password: "password123" }));
    expect(user).toEqual({ id: 1, email: "user@example.com" });
    expect(resHeaders.get("set-cookie")).toContain("token=");
  });

  it("rejects a wrong password", async () => {
    const { caller } = createContext();
    await expect(caller.login(formData({ email: "user@example.com", password: "wrong" }))).rejects.toThrow(
      "Incorrect email or password",
    );
  });

  it("rejects an unknown email", async () => {
    const { caller } = createContext();
    await expect(caller.login(formData({ email: "unknown@example.com", password: "password123" }))).rejects.toThrow(
      "Incorrect email or password",
    );
  });

  it("performs hashing work for unknown emails so timing does not reveal registration", async () => {
    const hash = vi.spyOn(fakeHasher, "hash");
    const { caller } = createContext();
    await expect(caller.login(formData({ email: "unknown@example.com", password: "password123" }))).rejects.toThrow(
      "Incorrect email or password",
    );
    expect(hash).toHaveBeenCalledWith("password123");
    hash.mockRestore();
  });

  it("rejects missing form fields", async () => {
    const { caller } = createContext();
    await expect(caller.login(new FormData())).rejects.toThrow();
  });
});

describe("logout", () => {
  it("clears the session cookie", async () => {
    const { caller, resHeaders } = createContext();
    await caller.logout();
    expect(resHeaders.get("set-cookie")).toContain("Max-Age=0");
  });
});

describe("me", () => {
  it("rejects unauthenticated requests", async () => {
    const { caller } = createContext();
    await expect(caller.me()).rejects.toThrow("Unauthorized");
  });

  it("returns the authenticated user", async () => {
    const { caller } = createContext({ id: 1, email: "user@example.com" });
    expect(await caller.me()).toEqual({ id: 1, email: "user@example.com" });
  });
});

describe("password reset", () => {
  it("does not reveal whether an email is registered", async () => {
    const { caller } = createContext();
    const result = await caller.passwordReset(formData({ email: "unknown@example.com" }));
    expect(result).toEqual({ success: true });
    expect(messages).toHaveLength(0);
  });

  it("rejects an invalid token", async () => {
    const { caller } = createContext();
    await expect(
      caller.passwordResetComplete(formData({ token: "not-a-real-token", password: "new-password-123" })),
    ).rejects.toThrow("invalid or has expired");
  });

  it("emails a reset link that lets the user set a new password", async () => {
    const { caller } = createContext();
    await caller.passwordReset(formData({ email: "user@example.com" }));
    await vi.waitFor(() => expect(messages).toHaveLength(1));
    const message = messages[0];
    expect(message.to).toBe("user@example.com");
    expect(message.from).toBe(config.EMAIL_FROM);
    const token = message.html.match(/token=([a-f0-9]+)/)?.[1];
    expect(token).toBeDefined();
    await caller.passwordResetComplete(formData({ token: token!, password: "new-password-123" }));
    await expect(caller.login(formData({ email: "user@example.com", password: "password123" }))).rejects.toThrow();
    const user = await caller.login(formData({ email: "user@example.com", password: "new-password-123" }));
    expect(user.email).toBe("user@example.com");
  });

  it("logs when the reset email fails to send", async () => {
    const memoryLogger = createMemoryLogger();
    const failingEmail = createEmailService({
      renderer: reactEmailRenderer,
      transport: {
        async send() {
          throw new Error("SMTP down");
        },
      },
      defaultFrom: config.EMAIL_FROM,
    });
    const { caller } = createContext(null, { email: failingEmail, logger: memoryLogger.logger });
    const result = await caller.passwordReset(formData({ email: "user@example.com" }));
    expect(result).toEqual({ success: true });
    await vi.waitFor(() => {
      expect(memoryLogger.entries.some((entry) => entry.level === "error")).toBe(true);
    });
  });
});

describe("rate limiting", () => {
  it("blocks repeated login attempts", async () => {
    const { caller } = createContext();
    for (let attempt = 0; attempt < 10; attempt++) {
      await expect(caller.login(formData({ email: "user@example.com", password: "wrong" }))).rejects.toThrow(
        "Incorrect email or password",
      );
    }
    await expect(caller.login(formData({ email: "user@example.com", password: "wrong" }))).rejects.toThrow(
      "Too many attempts",
    );
  });

  it("blocks repeated password reset requests", async () => {
    const { caller } = createContext();
    for (let attempt = 0; attempt < 3; attempt++) {
      await caller.passwordReset(formData({ email: "reset-limit@example.com" }));
    }
    await expect(caller.passwordReset(formData({ email: "reset-limit@example.com" }))).rejects.toThrow(
      "Too many reset requests",
    );
  });
});
