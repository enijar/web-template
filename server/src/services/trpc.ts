import { initTRPC } from "@trpc/server";
import { type AppContext } from "./app";

export const trpc = initTRPC.context<AppContext>().create();

export default trpc;
