import path from "node:path";
import fs from "node:fs";
import { config as dotenv } from "@dotenvx/dotenvx";
import { z } from "zod/v4";

const root = path.join(import.meta.dirname, "..", "..");
const envFiles = {
  development: path.join(root, ".env.dev"),
  staging: path.join(root, ".env.uat"),
  production: path.join(root, ".env.prod"),
};
const localFile = path.join(root, ".env.local");

function load(file: string, override = false) {
  if (!fs.existsSync(file)) return {};
  return dotenv({ path: file, quiet: true, override }).parsed ?? {};
}

// .env.local loads first so its APP_ENV can pick the encrypted file, and wins on every
// value because it overrides process.env, which the schema reads last.
const localEnv = load(localFile, true);
const appEnv = process.env.APP_ENV ?? "production";
const env = { ...load(envFiles[appEnv as keyof typeof envFiles] ?? envFiles.production), ...localEnv };

const config = z
  .object({
    PORT: z.coerce.number().gte(0).lte(65535),
    APP_URL: z.url().nonempty(),
    DATABASE_DIALECT: z.enum(["sqlite3", "mysql"]),
    DATABASE_URL: z.string().nonempty(),
    JWT_SECRET: z
      .string()
      .nonempty()
      .transform((arg) => new TextEncoder().encode(arg)),
    EMAIL_FROM: z.email().nonempty(),
    EMAIL_SMTP_API_KEY: z.string().nonempty(),
    BASE_PATH: z.string().nonempty(),
    // Trust x-real-ip/x-forwarded-for for the client IP; disable if the server is exposed without a reverse proxy
    TRUST_PROXY: z.stringbool().default(true),
    // Which deployment this process serves; picks the .env.dev/.env.uat/.env.prod file above
    APP_ENV: z.enum(["development", "staging", "production"]).default("production"),
    NODE_ENV: z.enum(["development", "production"]).default("production"),
  })
  .parse({ ...env, ...process.env });

export type AppConfig = typeof config;

export default config;
