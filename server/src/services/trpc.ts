import { initTRPC, TRPCError } from "@trpc/server";
import z from "zod";
import type { AppContext } from "~/services/app.js";

export const trpc = initTRPC.context<AppContext>().create({
  errorFormatter({ shape, error }) {
    if (error.cause instanceof z.ZodError) {
      const { fieldErrors } = error.cause.flatten();
      const allMessages = Object.values(fieldErrors).flat().filter(Boolean);
      const message = allMessages.length ? allMessages.join("; ") : shape.message;
      return {
        ...shape,
        message,
        data: {
          ...shape.data,
          zodError: fieldErrors,
        },
      };
    }
    return shape;
  },
});

export const publicProcedure = trpc.procedure.use(
  trpc.middleware(async (opts) => {
    const next = await opts.next();
    if (!next.ok) {
      console.error(next.error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Server error, try again later" });
    }
    return next;
  }),
);

export default trpc;
