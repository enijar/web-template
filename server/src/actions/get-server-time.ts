import { publicProcedure } from "~/services/trpc.js";

export const getServerTime = publicProcedure.query(() => {
  return Date.now();
});
