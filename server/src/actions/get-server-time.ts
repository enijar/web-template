import trpc from "~/services/trpc.js";

const getServerTime = trpc.procedure.query(() => {
  return Date.now();
});

export default getServerTime;
