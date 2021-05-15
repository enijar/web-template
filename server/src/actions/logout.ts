import type { Request, Response } from "express";
import config from "../config";

export default async function logout(req: Request, res: Response) {
  try {
    req.cookies.set("authToken", "");
    res.redirect(config.appUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: { server: "Server error" } });
  }
}
