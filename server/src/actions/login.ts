import { Request, Response } from "express";
import { compare } from "bcrypt";
import { loginModel } from "@app/shared";
import User from "../entities/user";
import auth from "../services/auth";

export default async function login(req: Request, res: Response) {
  try {
    const data = req.body ?? {};
    const { valid, errors } = loginModel.fresh(data).validate();

    if (!valid) {
      res.status(422).json({ errors });
      return;
    }

    const user = await User.findOne({ where: { email: data.email } });
    if (user === null) {
      res.status(401).json({ errors: { server: "Unauthorised" } });
      return;
    }

    const authenticated = await compare(data.password, user.password);
    if (!authenticated) {
      res.status(401).json({ errors: { server: "Unauthorised" } });
      return;
    }

    const authToken = await auth.sign(user);

    req.cookies.set("authToken", authToken);

    res.json({ data: { user } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: { server: "Server Error" } });
  }
}
