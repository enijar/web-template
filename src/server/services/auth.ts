import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { generateCookie } from "hono/cookie";
import type User from "server/models/user.js";

export const COOKIE_NAME = "token";

const DEFAULT_SESSION_TTL = 60 * 60 * 24 * 30; // 30 days

interface Payload extends JWTPayload {
  id: User["id"];
  email: User["email"];
  tokenVersion: User["tokenVersion"];
}

type SessionUser = Pick<User, "id" | "email" | "tokenVersion">;

export type PasswordHasher = {
  hash(password: string): Promise<string>;
  verify(hash: string, password: string): Promise<boolean>;
};

export type AuthServiceOptions = {
  secret: Uint8Array;
  secureCookies: boolean;
  hasher: PasswordHasher;
  sessionTtl?: number; // seconds, applies to both the JWT expiry and the cookie max-age
};

export type AuthService = ReturnType<typeof createAuthService>;

export function createAuthService(options: AuthServiceOptions) {
  const sessionTtl = options.sessionTtl ?? DEFAULT_SESSION_TTL;
  const auth = {
    sign(user: SessionUser) {
      const jwt = new SignJWT({ id: user.id, email: user.email, tokenVersion: user.tokenVersion });
      jwt.setProtectedHeader({ alg: "HS256" });
      jwt.setExpirationTime(`${sessionTtl}s`);
      return jwt.sign(options.secret);
    },
    async verify(token: string = "") {
      if (token === "") {
        return null;
      }
      const { payload } = await jwtVerify<Payload>(token, options.secret);
      return payload;
    },
    cookie(token: string) {
      return generateCookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: options.secureCookies,
        sameSite: "Lax",
        path: "/",
        maxAge: token === "" ? 0 : sessionTtl,
      });
    },
    hashPassword(password: string) {
      return options.hasher.hash(password);
    },
    verifyPassword(hash: string, password: string) {
      return options.hasher.verify(hash, password);
    },
    async startSession(user: SessionUser, headers: Headers) {
      headers.append("set-cookie", auth.cookie(await auth.sign(user)));
    },
    endSession(headers: Headers) {
      headers.append("set-cookie", auth.cookie(""));
    },
  };
  return auth;
}
