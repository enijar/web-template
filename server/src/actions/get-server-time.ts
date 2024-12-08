import trpc from "../services/trpc.js";

const getServerTime = trpc.procedure.mutation(async () => {
  return Date.now();
});

export default getServerTime;
