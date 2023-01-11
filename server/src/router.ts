import trpc from "./services/trpc";
import getServerTime from "./actions/get-server-time";

const router = trpc.router({
  getServerTime,
});

export type Router = typeof router;

export default router;
