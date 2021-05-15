import { Router } from "express";
import authenticate from "./middleware/authenticate";
import user from "./actions/user";
import login from "./actions/login";
import register from "./actions/register";
import logout from "./actions/logout";

const router = Router();

router.get("/api/user", [authenticate], user);
router.post("/api/login", login);
router.post("/api/register", register);
router.get("/api/logout", logout);

export default router;
