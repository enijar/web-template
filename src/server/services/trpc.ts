import { z } from "zod/v4";
import { initTRPC } from "@trpc/server";
import type { AppContext } from "server/services/app.js";

export const trpc = initTRPC.context<AppContext>().create({
  errorFormatter(opts) {
    let message = opts.error?.message ?? "Something went wrong";
    if (opts.error.cause instanceof z.ZodError) {
      message = z.prettifyError(opts.error.cause);
    }
    return {
      ...opts.shape,
      message,
    };
  },
});

export const publicProcedure = trpc.procedure.use(
  trpc.middleware(async (opts) => {
    return await opts.next();
  }),
);

export default trpc;
