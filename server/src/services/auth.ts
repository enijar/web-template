import { JwtPayload, sign, verify } from "jsonwebtoken";
import config from "../config";
import User from "../models/user";

const secret = config.jwt.secret;
const expiresIn = "30d";

interface TokenData extends JwtPayload {
  id: User["id"];
  email: User["email"];
}

const auth = {
  sign(user: User): string {
    return sign({ id: user.id, email: user.email }, secret, { expiresIn });
  },

  verify(token: string = ""): TokenData | null {
    if (token === "") {
      return null;
    }
    return verify(token, secret) as TokenData;
  },
};

export default auth;
