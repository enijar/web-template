import { publicProcedure } from "server/services/trpc.js";
import auth from "server/services/auth.js";

export const logout = publicProcedure.mutation((opts) => {
  opts.ctx.resHeaders.append("set-cookie", auth.cookie(""));
  return { success: true };
});
