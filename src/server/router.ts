import trpc from "server/services/trpc.js";

const router = trpc.router({
  ...(await import("server/actions/get-server-time.js")),
});

export type Router = typeof router;

export default router;
