import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { getCookie } from "hono/cookie";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { getConnInfo } from "@hono/node-server/conninfo";
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
  ip: string;
};

// tRPC inputs are buffered into memory before rate limits run, so they stay small;
// routes that need large bodies (e.g. uploads) should set their own route-scoped bodyLimit
const MAX_BODY_SIZE = 1024 * 1024; // 1 MB

function clientIp(ctx: Context, trustProxy: boolean) {
  if (trustProxy) {
    const realIp = ctx.req.header("x-real-ip");
    if (realIp !== undefined) {
      return realIp;
    }
    // The rightmost x-forwarded-for entry is the one appended by our own proxy
    const lastForwarded = ctx.req.header("x-forwarded-for")?.split(",").at(-1)?.trim();
    if (lastForwarded !== undefined && lastForwarded !== "") {
      return lastForwarded;
    }
  }
  try {
    return getConnInfo(ctx).remote.address ?? "unknown";
  } catch {
    return "unknown";
  }
}

export function createApp(services: AppServices) {
  async function createContext(opts: { resHeaders: Headers }, ctx: Context): Promise<AppContext> {
    let user: Awaited<ReturnType<AuthService["verify"]>>;
    try {
      user = await services.auth.verify(getCookie(ctx, COOKIE_NAME));
    } catch {
      user = null;
    }
    return { ...services, resHeaders: opts.resHeaders, user, ip: clientIp(ctx, services.config.TRUST_PROXY) };
  }

  const app = new Hono();

  app.use(secureHeaders());

  app.use(cors({ origin: services.config.APP_URL, credentials: true }));

  app.use("/trpc/*", bodyLimit({ maxSize: MAX_BODY_SIZE }));

  app.get("/api/health", async (ctx) => {
    try {
      await services.database.query("SELECT 1");
      return ctx.json({ status: "ok" });
    } catch (err) {
      services.logger.error("Health check failed", { error: err });
      return ctx.json({ status: "unavailable" }, 503);
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
