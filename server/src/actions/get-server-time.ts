import trpc from "../services/trpc";

const getServerTime = trpc.procedure.mutation(async () => {
  return Date.now();
});

export default getServerTime;
