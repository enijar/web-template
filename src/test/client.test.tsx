import React from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createApp } from "server/services/app.js";
import { createAuthService } from "server/services/auth.js";
import { createDatabase } from "server/services/database.js";
import { createEmailService } from "server/services/email.js";
import { createRateLimiter } from "server/services/rate-limiter.js";
import { reactEmailRenderer } from "server/adapters/react-email.js";
import { createMemoryRateLimitStore } from "server/adapters/memory.js";
import models from "server/models/index.js";
import User from "server/models/user.js";
import { createApi } from "client/services/api.js";
import { appState } from "client/state/app-state.js";
import router from "client/router.js";
import App from "client/components/app/app.js";
import { createMemoryLogger, createMemoryTransport, createTestConfig, fakeHasher } from "./helpers.js";

const config = createTestConfig();
const database = createDatabase({ dialect: config.DATABASE_DIALECT, url: config.DATABASE_URL, models });
const auth = createAuthService({ secret: config.JWT_SECRET, secureCookies: false, hasher: fakeHasher });
const { messages, transport } = createMemoryTransport();
const email = createEmailService({ renderer: reactEmailRenderer, transport, defaultFrom: config.EMAIL_FROM });
const app = createApp({
  config,
  auth,
  database,
  email,
  logger: createMemoryLogger().logger,
  rateLimiter: createRateLimiter({ store: createMemoryRateLimitStore() }),
});

// A fetch that routes requests to the in-memory server and keeps session cookies like a browser
function createTestFetch(): typeof globalThis.fetch {
  const cookies = new Map<string, string>();
  return async (input, init) => {
    const url = input instanceof URL ? input.href : typeof input === "string" ? input : input.url;
    const headers = new Headers(init?.headers);
    if (cookies.size > 0) {
      headers.set("cookie", Array.from(cookies, ([name, value]) => `${name}=${value}`).join("; "));
    }
    const res = await app.request(url, { ...init, headers });
    for (const setCookie of res.headers.getSetCookie()) {
      const [pair = "", ...attributes] = setCookie.split(";");
      const separator = pair.indexOf("=");
      const name = pair.slice(0, separator).trim();
      const value = pair.slice(separator + 1).trim();
      const expired = attributes.some((attribute) => attribute.trim().toLowerCase() === "max-age=0");
      if (expired || value === "") {
        cookies.delete(name);
      } else {
        cookies.set(name, value);
      }
    }
    return res;
  };
}

function createTestApi() {
  return createApi({
    url: "http://localhost/trpc",
    fetch: createTestFetch(),
    onUnauthorized() {
      appState.getState().setUser(null);
    },
  });
}

beforeAll(async () => {
  await database.sync();
});

beforeEach(async () => {
  appState.setState({ user: null });
  await router.navigate("/", { replace: true });
});

afterEach(cleanup);

describe("client app", () => {
  it("shows the login form to a signed-out visitor", async () => {
    render(<App api={createTestApi()} />);
    expect(await screen.findByRole("button", { name: "Login" })).toBeTruthy();
  });

  it("registers a new account and signs the user in", async () => {
    const user = userEvent.setup();
    render(<App api={createTestApi()} />);
    await user.click(await screen.findByRole("link", { name: "Need an account? Register" }));
    // The old page stays mounted while the register page lazy-loads, so wait for the swap
    await screen.findByRole("heading", { name: "Register" });
    await user.type(screen.getByLabelText("Email"), "register@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Register" }));
    expect(await screen.findByText("Signed in as register@example.com")).toBeTruthy();
  });

  it("shows validation errors from the server on the register form", async () => {
    const user = userEvent.setup();
    render(<App api={createTestApi()} />);
    await user.click(await screen.findByRole("link", { name: "Need an account? Register" }));
    await screen.findByRole("heading", { name: "Register" });
    await user.type(screen.getByLabelText("Email"), "short@example.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Register" }));
    expect(await screen.findByText(/Password must be at least 8 characters/)).toBeTruthy();
  });

  it("logs in with valid credentials and logs out", async () => {
    await User.create({ email: "login@example.com", password: await fakeHasher.hash("password123") });
    const user = userEvent.setup();
    render(<App api={createTestApi()} />);
    await user.type(await screen.findByLabelText("Email"), "login@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(await screen.findByText("Incorrect email or password, try again")).toBeTruthy();
    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(await screen.findByText("Signed in as login@example.com")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Logout" }));
    expect(await screen.findByRole("button", { name: "Login" })).toBeTruthy();
  });

  it("restores the session from the cookie and clears it once revoked", async () => {
    await User.create({ email: "revoked@example.com", password: await fakeHasher.hash("password123") });
    const api = createTestApi();
    const user = userEvent.setup();
    const first = render(<App api={api} />);
    await user.type(await screen.findByLabelText("Email"), "revoked@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(await screen.findByText("Signed in as revoked@example.com")).toBeTruthy();
    // A fresh visit with the same cookie jar restores the session
    first.unmount();
    api.queryClient.clear();
    const second = render(<App api={api} />);
    expect(await screen.findByText("Signed in as revoked@example.com")).toBeTruthy();
    // Once the user's sessions are revoked, the same cookie signs them out
    second.unmount();
    await User.update({ tokenVersion: 1 }, { where: { email: "revoked@example.com" } });
    api.queryClient.clear();
    render(<App api={api} />);
    expect(await screen.findByRole("button", { name: "Login" })).toBeTruthy();
  });

  it("resets a forgotten password end to end", async () => {
    await User.create({ email: "forgot@example.com", password: await fakeHasher.hash("old-password") });
    const user = userEvent.setup();
    render(<App api={createTestApi()} />);
    await user.click(await screen.findByRole("button", { name: "Forgot Password?" }));
    await user.type(screen.getByLabelText("Email"), "forgot@example.com");
    await user.click(screen.getByRole("button", { name: "Reset password" }));
    expect(await screen.findByText("If that email is registered, a reset link is on its way.")).toBeTruthy();
    // The reset email is sent in the background after the mutation resolves
    await vi.waitFor(() => {
      expect(messages.at(-1)?.to).toBe("forgot@example.com");
    });
    const token = /token=([0-9a-f]+)/.exec(messages.at(-1)?.html ?? "")?.[1];
    expect(token).toBeTruthy();
    await act(async () => {
      await router.navigate(`/reset-password?token=${token}`);
    });
    await user.type(await screen.findByLabelText("New password"), "new-password-123");
    await user.click(screen.getByRole("button", { name: "Reset password" }));
    await user.click(await screen.findByRole("link", { name: "Log in" }));
    await user.type(await screen.findByLabelText("Email"), "forgot@example.com");
    await user.type(screen.getByLabelText("Password"), "new-password-123");
    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(await screen.findByText("Signed in as forgot@example.com")).toBeTruthy();
  });
});
