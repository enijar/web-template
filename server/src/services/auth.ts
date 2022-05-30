import { JwtPayload, sign, verify } from "jsonwebtoken";
import config from "../config";
import User from "../entities/user";

interface TokenData extends JwtPayload {
  id: number;
  email: string;
}

const auth = {
  sign(user: User) {
    return sign({ id: user.id, email: user.email }, config.jwt.secret, {
      expiresIn: "30d",
    });
  },

  verify(token: string = ""): TokenData {
    return verify(token, config.jwt.secret) as TokenData;
  },
};

export default auth;
