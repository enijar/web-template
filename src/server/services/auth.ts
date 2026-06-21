import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { generateCookie } from "hono/cookie";
import config from "config/index.js";
import User from "server/models/user.js";

export const COOKIE_NAME = "token";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

interface Payload extends JWTPayload {
  id: User["id"];
  email: User["email"];
}

const auth = {
  sign(user: User) {
    const jwt = new SignJWT({ id: user.id, email: user.email });
    jwt.setProtectedHeader({ alg: "HS256" });
    jwt.setExpirationTime("30d");
    return jwt.sign(config.JWT_SECRET);
  },
  async verify(token: string = "") {
    if (token === "") {
      return null;
    }
    const { payload } = await jwtVerify<Payload>(token, config.JWT_SECRET);
    return payload;
  },
  cookie(token: string) {
    return generateCookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: config.APP_URL.startsWith("https"),
      sameSite: "Lax",
      path: "/",
      maxAge: token === "" ? 0 : MAX_AGE,
    });
  },
};

export default auth;
