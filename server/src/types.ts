import type { Request } from "express";
import type User from "./models/user";

export type PrivateRequest = Request & {
  user: User;
};
