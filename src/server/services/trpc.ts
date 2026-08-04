import { z } from "zod/v4";
import { initTRPC, TRPCError } from "@trpc/server";
import type { AppContext } from "server/services/app.js";
import User from "server/models/user.js";

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

// FormData is reconstructed by the fetch runtime, whose constructor can differ from this
// realm's global (e.g. undici vs jsdom in the client tests), so check shape, not identity
function isFormData(value: unknown): value is FormData {
  return value instanceof FormData || Object.prototype.toString.call(value) === "[object FormData]";
}

export function formInput<Shape extends z.ZodRawShape>(shape: Shape) {
  return z
    .custom<FormData>(isFormData, "Expected form data")
    .transform((form): unknown => {
      const values: Record<string, unknown> = {};
      for (const key of Object.keys(shape)) {
        values[key] = form.get(key);
      }
      return values;
    })
    .pipe(z.object(shape));
}

export const publicProcedure = trpc.procedure.use(
  trpc.middleware(async (opts) => {
    return await opts.next();
  }),
);

export const privateProcedure = trpc.procedure.use(
  trpc.middleware(async (opts) => {
    if (opts.ctx.user === null) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }
    // A JWT outlives account changes, so re-check it against the database: a
    // mismatched tokenVersion means the user's sessions have been revoked
    const user = await User.findByPk(opts.ctx.user.id);
    if (user === null || user.tokenVersion !== opts.ctx.user.tokenVersion) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }
    return await opts.next({ ctx: { user } });
  }),
);

export default trpc;
