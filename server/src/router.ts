import { Router } from "express";
import login from "./actions/login";
import register from "./actions/register";

const router = Router();

router.post("/api/login", login);
router.post("/api/register", register);

export default router;
