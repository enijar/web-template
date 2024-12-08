import express from "express";
import cors from "cors";
import { type CreateExpressContextOptions, createExpressMiddleware } from "@trpc/server/adapters/express";
import config from "../config.js";
import cookies from "../middleware/cookies.js";
import router from "../router.js";
import auth from "./auth.js";
import User from "../models/user.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin(origin, next) {
      if (origin && !config.corsOrigins.includes(origin)) {
        return next(new Error("Not allowed by CORS"));
      }
      next(null, true);
    },
    credentials: true,
  }),
);
app.use(cookies);

export const createContext = async ({ req, res }: CreateExpressContextOptions) => {
  const data = await auth.verify(req.cookies.get("authToken"));
  let user: User | null = null;
  if (data !== null) {
    user = await User.findByPk(data.id);
  }
  return { req, res, user };
};

export type AppContext = Awaited<ReturnType<typeof createContext>>;

app.use("/trpc", createExpressMiddleware({ router, createContext }));

export default app;
