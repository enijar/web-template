import { JsonWebTokenError } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import User from "../entities/user";
import auth from "../services/auth";

export default async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authToken = req.cookies.get("authToken");
    const { email = "" } = await auth.verify(authToken);

    const user = await User.findOne({ where: { email } });

    if (user === null) {
      res.status(401).json({ errors: { server: "Unauthorised" } });
    } else {
      // @ts-ignore
      req.user = user;
      req.cookies.set("authToken", await auth.sign(user));
      next();
    }
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      res.status(401).json({ errors: { server: "Unauthorised" } });
    } else {
      console.error(err);
      res.status(500).json({ errors: { server: "Server error" } });
    }
  }
}
