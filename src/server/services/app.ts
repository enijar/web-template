import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import router from "server/router.js";

async function createContext() {
  return {};
}

export type AppContext = Awaited<ReturnType<typeof createContext>>;

const app = new Hono();

app.use(cors());

app.use("/trpc/*", trpcServer({ router, createContext }));

export default app;
