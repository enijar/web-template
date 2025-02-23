import { initTRPC } from "@trpc/server";
import type { AppContext } from "~/services/app.js";

export const trpc = initTRPC.context<AppContext>().create();

export default trpc;
