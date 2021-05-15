import type { Response } from "express";
import type { PrivateRequest } from "../types";

export default async function user(req: PrivateRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({ errors: { server: "Unauthorised" } });
    return;
  }

  res.json({ data: { user: req.user.toJSON() } });
}
