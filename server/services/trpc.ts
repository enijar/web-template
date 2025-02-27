import { initTRPC } from "@trpc/server";
import type { AppContext } from "server/services/app.js";

export const trpc = initTRPC.context<AppContext>().create();

export default trpc;
