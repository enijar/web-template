import trpc from "server/services/trpc.js";

const router = trpc.router({
  ...(await import("server/actions/login.js")),
  ...(await import("server/actions/logout.js")),
  ...(await import("server/actions/me.js")),
  ...(await import("server/actions/password-reset.js")),
  ...(await import("server/actions/password-reset-complete.js")),
});

export type Router = typeof router;

export default router;
