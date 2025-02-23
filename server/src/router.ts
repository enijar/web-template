import trpc from "~/services/trpc.js";
import getServerTime from "~/actions/get-server-time.js";

const router = trpc.router({
  getServerTime,
});

export type Router = typeof router;

export default router;
