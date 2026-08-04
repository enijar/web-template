import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { getCookie } from "hono/cookie";
import { trpcServer } from "@hono/trpc-server";
import router from "server/router.js";
import { COOKIE_NAME, type AuthService } from "server/services/auth.js";
import type { DatabaseService } from "server/services/database.js";
import type { EmailService } from "server/services/email.js";
import type { AppConfig } from "config/index.js";

export type AppServices = {
  config: AppConfig;
  auth: AuthService;
  database: DatabaseService;
  email: EmailService;
};

export type AppContext = AppServices & {
  resHeaders: Headers;
  user: Awaited<ReturnType<AuthService["verify"]>>;
};

export function createApp(services: AppServices) {
  async function createContext(opts: { resHeaders: Headers }, c: Context): Promise<AppContext> {
    let user: Awaited<ReturnType<AuthService["verify"]>>;
    try {
      user = await services.auth.verify(getCookie(c, COOKIE_NAME));
    } catch {
      user = null;
    }
    return { ...services, resHeaders: opts.resHeaders, user };
  }

  const app = new Hono();

  app.use(cors({ origin: services.config.APP_URL, credentials: true }));

  app.use("/trpc/*", trpcServer({ router, createContext }));

  return app;
}
