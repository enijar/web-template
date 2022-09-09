import * as trpc from "@trpc/server";
import { type AppContext } from "../services/app";

const getServerTime = trpc.router<AppContext>().mutation("getServerTime", {
  async resolve() {
    return Date.now();
  },
});

export default getServerTime;
