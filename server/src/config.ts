import * as path from "path";
import { z } from "zod";
import User from "./models/user";

const env = z.object({
  PORT: z.string(),
  APP_URL: z.string(),
  CORS_ORIGINS: z.string(),
  BCRYPT_ROUNDS: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_NAME: z.string(),
  DATABASE_DIALECT: z.enum(["mysql", "sqlite"]),
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
    name: process.env.DATABASE_NAME,
    dialect: process.env.DATABASE_DIALECT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    models: [User],
  },
  jwt: {
    secret: process.env.JWT_SECRET,
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
