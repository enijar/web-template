import path from "node:path";
import { config as dotenv } from "dotenv";
import { z } from "zod/v4";

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
  })
  .parse(dotenv({ path: path.join(import.meta.dirname, "..", "..", ".env") }).parsed);

export default config;
