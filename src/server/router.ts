import trpc from "server/services/trpc.js";

const router = trpc.router({
  ...(await import("server/actions/login.js")),
  ...(await import("server/actions/password-reset.js")),
});

export type Router = typeof router;

export default router;
