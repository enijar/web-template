import path from "node:path";
import url from "node:url";
import { config as dotenv } from "dotenv";
import { z } from "zod";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv({ path: path.resolve(__dirname, "..", ".env") });

const env = z.object({
  PORT: z.string(),
  APP_URL: z.string(),
  CORS_ORIGINS: z.string(),
  BCRYPT_ROUNDS: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.string(),
  DATABASE_NAME: z.string(),
  DATABASE_USERNAME: z.string(),
  DATABASE_PASSWORD: z.string(),
  JWT_SECRET: z.string(),
  EMAIL_PREVIEW: z.string(),
  EMAIL_SEND: z.string(),
  EMAIL_FROM: z.string(),
  EMAIL_SMTP_HOST: z.string(),
  EMAIL_SMTP_PORT: z.string(),
  EMAIL_SMTP_USERNAME: z.string(),
  EMAIL_SMTP_PASSWORD: z.string(),
});

env.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof env> {}
  }
}

const config = {
  port: parseInt(process.env.PORT),
  appUrl: process.env.APP_URL,
  corsOrigins: process.env.CORS_ORIGINS.split(","),
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS),
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    name: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    models: path.resolve(__dirname, "models", "*.{ts,js}"),
  },
  jwt: {
    secret: new TextEncoder().encode(process.env.JWT_SECRET),
  },
  email: {
    preview: process.env.EMAIL_PREVIEW === "true",
    send: process.env.EMAIL_SEND === "true",
    from: process.env.EMAIL_FROM,
    templates: path.resolve(__dirname, "..", "emails"),
    transport: {
      host: process.env.EMAIL_SMTP_HOST,
      port: parseInt(process.env.EMAIL_SMTP_PORT),
      auth: {
        user: process.env.EMAIL_SMTP_USERNAME,
        pass: process.env.EMAIL_SMTP_PASSWORD,
      },
    },
  },
};

export default config;
