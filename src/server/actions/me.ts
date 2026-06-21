import { privateProcedure } from "server/services/trpc.js";

export const me = privateProcedure.query((opts) => {
  return {
    id: opts.ctx.user.id,
    email: opts.ctx.user.email,
  };
});
