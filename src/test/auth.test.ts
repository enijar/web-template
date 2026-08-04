import { describe, expect, it } from "vitest";
import { COOKIE_NAME, createAuthService } from "server/services/auth.js";
import { argon2Hasher } from "server/adapters/argon2.js";
import { fakeHasher } from "./helpers.js";

function createAuth(secureCookies = false, secret = "test-secret") {
  return createAuthService({
    secret: new TextEncoder().encode(secret),
    secureCookies,
    hasher: fakeHasher,
  });
}

describe("auth service", () => {
  it("signs a token that verifies back to the user payload", async () => {
    const auth = createAuth();
    const token = await auth.sign({ id: 1, email: "user@example.com" });
    const payload = await auth.verify(token);
    expect(payload).toMatchObject({ id: 1, email: "user@example.com" });
  });

  it("returns null for a missing token", async () => {
    const auth = createAuth();
    expect(await auth.verify()).toBe(null);
    expect(await auth.verify("")).toBe(null);
  });

  it("rejects a token signed with a different secret", async () => {
    const auth = createAuth();
    const other = createAuth(false, "other-secret");
    const token = await other.sign({ id: 1, email: "user@example.com" });
    await expect(auth.verify(token)).rejects.toThrow();
  });

  it("creates a session cookie", async () => {
    const auth = createAuth();
    const cookie = auth.cookie("abc");
    expect(cookie).toContain(`${COOKIE_NAME}=abc`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("Max-Age=2592000");
    expect(cookie).not.toContain("Secure");
  });

  it("uses the session ttl for both the token expiry and the cookie max-age", async () => {
    const auth = createAuthService({
      secret: new TextEncoder().encode("test-secret"),
      secureCookies: false,
      hasher: fakeHasher,
      sessionTtl: 60,
    });
    const token = await auth.sign({ id: 1, email: "user@example.com" });
    const payload = await auth.verify(token);
    const expected = Math.floor(Date.now() / 1000) + 60;
    expect(payload?.exp).toBeGreaterThanOrEqual(expected - 5);
    expect(payload?.exp).toBeLessThanOrEqual(expected + 5);
    expect(auth.cookie("abc")).toContain("Max-Age=60");
  });

  it("expires the cookie when the token is empty", () => {
    const auth = createAuth();
    expect(auth.cookie("")).toContain("Max-Age=0");
  });

  it("marks the cookie secure when configured", () => {
    const auth = createAuth(true);
    expect(auth.cookie("abc")).toContain("Secure");
  });

  it("starts a session by appending a signed cookie to the response headers", async () => {
    const auth = createAuth();
    const headers = new Headers();
    await auth.startSession({ id: 1, email: "user@example.com" }, headers);
    const cookie = headers.get("set-cookie");
    expect(cookie).toContain(`${COOKIE_NAME}=`);
    const token = cookie?.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))?.[1];
    expect(await auth.verify(token)).toMatchObject({ id: 1, email: "user@example.com" });
  });

  it("ends a session by appending an expired cookie to the response headers", () => {
    const auth = createAuth();
    const headers = new Headers();
    auth.endSession(headers);
    const cookie = headers.get("set-cookie");
    expect(cookie).toContain(`${COOKIE_NAME}=;`);
    expect(cookie).toContain("Max-Age=0");
  });

  it("hashes and verifies passwords through the hasher", async () => {
    const auth = createAuth();
    const hash = await auth.hashPassword("password123");
    expect(await auth.verifyPassword(hash, "password123")).toBe(true);
    expect(await auth.verifyPassword(hash, "wrong")).toBe(false);
  });
});

describe("argon2Hasher", () => {
  it("hashes and verifies a password", async () => {
    const hash = await argon2Hasher.hash("password123");
    expect(hash).not.toBe("password123");
    expect(await argon2Hasher.verify(hash, "password123")).toBe(true);
    expect(await argon2Hasher.verify(hash, "wrong")).toBe(false);
  });
});
