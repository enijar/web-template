import * as trpc from "@trpc/server";
import { type AppContext } from "./services/app";
import getServerTime from "./actions/get-server-time";

const router = trpc.router<AppContext>().merge(getServerTime);

export type Router = typeof router;

export default router;
