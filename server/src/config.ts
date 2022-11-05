import * as path from "path";
import { Dialect } from "sequelize";
import User from "./models/user";

const config = {
  port: parseInt(process.env.PORT ?? "3000"),
  appUrl: process.env.APP_URL ?? "http://localhost:8080",
  corsOrigins: (process.env.CORS_ORIGINS ?? "").split(","),
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? "12"),
  database: {
    host: process.env.DATABASE_HOST ?? ":memory:",
    name: process.env.DATABASE_NAME ?? "app",
    dialect: (process.env.DATABASE_DIALECT ?? "sqlite") as Dialect,
    username: process.env.DATABASE_USERNAME ?? "app",
    password: process.env.DATABASE_PASSWORD ?? "secret",
    models: [User],
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? "secret",
  },
  email: {
    preview: process.env.EMAIL_PREVIEW === "true",
    send: process.env.EMAIL_SEND === "true",
    from: process.env.EMAIL_FROM,
    templates: path.resolve(__dirname, "..", "emails"),
    transport: {
      host: process.env.EMAIL_SMTP_HOST ?? "smtp.sendgrid.net",
      port: parseInt(process.env.EMAIL_SMTP_PORT ?? "587"),
      auth: {
        user: process.env.EMAIL_SMTP_USERNAME ?? "apikey",
        pass: process.env.EMAIL_SMTP_PASSWORD ?? "secret",
      },
    },
  },
};

export default config;
