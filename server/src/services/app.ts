import * as express from "express";
import { json } from "body-parser";
import * as cors from "cors";
import * as trpc from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import config from "../config";
import cookies from "../middleware/cookies";
import router from "../router";
import auth from "./auth";
import User from "../models/user";

const app = express();

app.use(json());
app.use(
  cors({
    origin(origin, next) {
      if (origin && !config.corsOrigins.includes(origin)) {
        return next(new Error("Not allowed by CORS"));
      }
      next(null, true);
    },
    credentials: true,
  })
);
app.use(cookies);

export const createContext = async ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  const data = await auth.verify(req.cookies.get("authToken"));
  let user: User | null = null;
  if (data !== null) {
    user = await User.findByPk(data.id);
  }
  return { req, res, user };
};

export type AppContext = trpc.inferAsyncReturnType<typeof createContext>;

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router,
    createContext,
  })
);

export default app;
