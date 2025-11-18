import { publicProcedure } from "server/services/trpc.js";

export const getServerTime = publicProcedure.query(() => {
  return Date.now();
});
