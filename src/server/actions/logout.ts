import { publicProcedure } from "server/services/trpc.js";

export const logout = publicProcedure.mutation((opts) => {
  opts.ctx.auth.endSession(opts.ctx.resHeaders);
  return { success: true };
});
