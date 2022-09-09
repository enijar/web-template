import { Request, Response } from "express";
import { compare } from "bcrypt";
import User from "../entities/user";
import auth from "../services/auth";

export default async function login(req: Request, res: Response) {
  try {
    const data = req.body ?? {};

    const user = await User.findOne({ where: { email: data.email } });
    if (user === null) {
      return res.status(401).json({ errors: { server: "Unauthorised" } });
    }

    const authenticated = await compare(data.password, user.password);
    if (!authenticated) {
      return res.status(401).json({ errors: { server: "Unauthorised" } });
    }

    const authToken = auth.sign(user);

    req.cookies.set("authToken", authToken);

    res.json({ data: { user } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: { server: "Server Error" } });
  }
}
