import path from "node:path";
import url from "node:url";
import { config as dotenv } from "dotenv";
import { z } from "zod";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const env = z
  .object({
    PORT: z.coerce.number().finite().gte(0).lte(65535),
    APP_URL: z.string(),
    DATABASE_HOST: z.string(),
    DATABASE_PORT: z.coerce.number().finite().gte(0).lte(65535),
    DATABASE_NAME: z.string(),
    DATABASE_USERNAME: z.string(),
    DATABASE_PASSWORD: z.string(),
    JWT_SECRET: z.string(),
    EMAIL_FROM: z.string(),
    EMAIL_SMTP_API_KEY: z.string(),
  })
  .parse(dotenv({ path: path.join(__dirname, "..", ".env") }).parsed);

const config = {
  port: env.PORT,
  appUrl: env.APP_URL,
  database: {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    name: env.DATABASE_NAME,
    username: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,
    models: path.join(__dirname, "models", "*.{ts,js}"),
  },
  jwt: {
    secret: new TextEncoder().encode(env.JWT_SECRET),
  },
  email: {
    from: env.EMAIL_FROM,
    apiKey: env.EMAIL_SMTP_API_KEY,
  },
};

export default config;
