import { sign, verify } from "jsonwebtoken";
import config from "../config";
import User from "../entities/user";

type TokenData = {
  id: number;
  email: string;
};

const auth = {
  sign(user: User) {
    return sign({ id: user.id, email: user.email }, config.jwt.secret, {
      expiresIn: "30d",
    });
  },

  async verify(token: string = ""): Promise<TokenData> {
    // @ts-ignore
    return verify(token, config.jwt.secret);
  },
};

export default auth;
