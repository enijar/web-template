import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { getCookie } from "hono/cookie";
import { trpcServer } from "@hono/trpc-server";
import router from "server/router.js";
import { COOKIE_NAME, type AuthService } from "server/services/auth.js";
import type { DatabaseService } from "server/services/database.js";
import type { EmailService } from "server/services/email.js";
import type { LoggerService } from "server/services/logger.js";
import type { RateLimiterService } from "server/services/rate-limiter.js";
import type { AppConfig } from "config/index.js";

export type AppServices = {
  config: AppConfig;
  auth: AuthService;
  database: DatabaseService;
  email: EmailService;
  logger: LoggerService;
  rateLimiter: RateLimiterService;
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

  app.get("/api/health", async (c) => {
    try {
      await services.database.query("SELECT 1");
      return c.json({ status: "ok" });
    } catch (err) {
      services.logger.error("Health check failed", { error: err });
      return c.json({ status: "unavailable" }, 503);
    }
  });

  app.use(
    "/trpc/*",
    trpcServer({
      router,
      createContext,
      onError({ error, path }) {
        if (error.code === "INTERNAL_SERVER_ERROR") {
          services.logger.error(`Unhandled error in ${path ?? "<unknown>"}`, { error: error.cause ?? error });
        }
      },
    }),
  );

  return app;
}
