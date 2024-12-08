import { JWTPayload, jwtVerify, SignJWT } from "jose";
import config from "../config.js";
import User from "../models/user.js";

const secret = config.jwt.secret;
const expiresIn = "30d";

interface Payload extends JWTPayload {
  id: User["id"];
  email: User["email"];
}

const auth = {
  sign(user: User) {
    const jwt = new SignJWT({ id: user.id, email: user.email });
    jwt.setExpirationTime(expiresIn);
    return jwt.sign(config.jwt.secret);
  },

  async verify(token: string = "") {
    if (token === "") {
      return null;
    }
    const { payload } = await jwtVerify<Payload>(token, secret);
    return payload;
  },
};

export default auth;
