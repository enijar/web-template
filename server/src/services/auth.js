import { jwtVerify, SignJWT } from "jose";
import config from "~/config.js";
const secret = config.jwt.secret;
const expiresIn = "30d";
const auth = {
    sign(user) {
        const jwt = new SignJWT({ id: user.id, email: user.email });
        jwt.setExpirationTime(expiresIn);
        return jwt.sign(config.jwt.secret);
    },
    async verify(token = "") {
        if (token === "") {
            return null;
        }
        const { payload } = await jwtVerify(token, secret);
        return payload;
    },
};
export default auth;
