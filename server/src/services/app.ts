import * as express from "express";
import { json } from "body-parser";
import * as cors from "cors";
import * as trpc from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import config from "../config";
import cookies from "../middleware/cookies";
import router from "../router";

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

export const createContext = async ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  const authToken = req.cookies.get("authToken");
  //
  return { req, res };
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
