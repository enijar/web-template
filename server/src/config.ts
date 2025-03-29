import path from "node:path";
import url from "node:url";
import { config as dotenv } from "dotenv";
import { z } from "zod";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const env = z
  .object({
    PORT: z.coerce.number().finite().gte(0).lte(65535),
    APP_URL: z.string(),
    CORS_ORIGINS: z.string(),
    BCRYPT_ROUNDS: z.coerce.number().finite().gte(1),
    DATABASE_HOST: z.string(),
    DATABASE_PORT: z.coerce.number().finite().gte(0).lte(65535),
    DATABASE_NAME: z.string(),
    DATABASE_USERNAME: z.string(),
    DATABASE_PASSWORD: z.string(),
    JWT_SECRET: z.string(),
    EMAIL_PREVIEW: z.string(),
    EMAIL_SEND: z.string(),
    EMAIL_FROM: z.string(),
    EMAIL_SMTP_HOST: z.string(),
    EMAIL_SMTP_PORT: z.coerce.number().gte(1),
    EMAIL_SMTP_USERNAME: z.string(),
    EMAIL_SMTP_PASSWORD: z.string(),
  })
  .parse(dotenv({ path: path.join(__dirname, "..", ".env") }).parsed);

const config = {
  port: env.PORT,
  appUrl: env.APP_URL,
  corsOrigins: env.CORS_ORIGINS.split(","),
  bcryptRounds: env.BCRYPT_ROUNDS,
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
    preview: env.EMAIL_PREVIEW === "true",
    send: env.EMAIL_SEND === "true",
    from: env.EMAIL_FROM,
    templates: path.join(__dirname, "..", "emails"),
    transport: {
      host: env.EMAIL_SMTP_HOST,
      port: env.EMAIL_SMTP_PORT,
      auth: {
        user: env.EMAIL_SMTP_USERNAME,
        pass: env.EMAIL_SMTP_PASSWORD,
      },
    },
  },
};

export default config;
