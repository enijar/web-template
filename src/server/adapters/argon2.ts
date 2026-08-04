import argon2 from "argon2";
import type { PasswordHasher } from "server/services/auth.js";

export const argon2Hasher: PasswordHasher = {
  hash(password) {
    return argon2.hash(password);
  },
  verify(hash, password) {
    return argon2.verify(hash, password);
  },
};
