import { JWTPayload, jwtVerify, SignJWT } from "jose";
import config from "config/index.js";
import User from "server/models/user.js";

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
};

export default auth;
