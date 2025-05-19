import trpc from "~/services/trpc.js";

const router = trpc.router({
  ...(await import("~/actions/get-server-time.js")),
});

export type Router = typeof router;

export default router;
