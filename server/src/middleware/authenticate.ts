import { JsonWebTokenError } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { PrivateRequest } from "../types";
import User from "../entities/user";
import auth from "../services/auth";

export default async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authToken = req.cookies.get("authToken");
    const { email = "" } = auth.verify(authToken);

    const user = await User.findOne({ where: { email } });

    if (user === null) {
      return res.status(401).json({ errors: { server: "Unauthorised" } });
    }

    (req as PrivateRequest).user = user;
    req.cookies.set("authToken", auth.sign(user));
    next();
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      res.status(401).json({ errors: { server: "Unauthorised" } });
    } else {
      console.error(err);
      res.status(500).json({ errors: { server: "Server error" } });
    }
  }
}
