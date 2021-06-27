import { Request, Response } from "express";
import { hash } from "bcrypt";
import { registerModel } from "@app/shared";
import config from "../config";
import User from "../entities/user";
import mail from "../services/email";

export default async function register(req: Request, res: Response) {
  try {
    const data = req.body ?? {};
    const { valid, errors } = registerModel.fresh(data).validate();

    if (!valid) {
      res.status(422).json({ errors });
      return;
    }

    const user = await User.findOne({ where: { email: data.email } });
    if (user !== null) {
      res
        .status(409)
        .json({ errors: { server: "That email is already registered" } });
      return;
    }

    const password = await hash(data.password, config.bcryptRounds);
    const registeredUser = await User.create({ email: data.email, password });

    await mail.send({
      template: "register",
      message: {
        subject: "Welcome",
        to: registeredUser.email,
      },
      locals: { user: registeredUser },
    });

    res.json({ messages: { server: "You're now registered" } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: { server: "Server Error" } });
  }
}
