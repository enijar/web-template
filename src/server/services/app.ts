import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { getCookie } from "hono/cookie";
import { trpcServer } from "@hono/trpc-server";
import router from "server/router.js";
import auth, { COOKIE_NAME } from "server/services/auth.js";
import config from "config/index.js";

async function createContext(opts: { resHeaders: Headers }, c: Context) {
  let user: Awaited<ReturnType<typeof auth.verify>>;
  try {
    user = await auth.verify(getCookie(c, COOKIE_NAME));
  } catch {
    user = null;
  }
  return { resHeaders: opts.resHeaders, user };
}

export type AppContext = Awaited<ReturnType<typeof createContext>>;

const app = new Hono();

app.use(cors({ origin: config.APP_URL, credentials: true }));

app.use("/trpc/*", trpcServer({ router, createContext }));

export default app;
