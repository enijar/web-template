import path from "node:path";
import { config as dotenv } from "dotenv";
import { z } from "zod";
const env = z
    .object({
    PORT: z.coerce.number().finite().gte(0).lte(65535),
    APP_URL: z.string().nonempty().url(),
    DATABASE_HOST: z.string().nonempty(),
    DATABASE_PORT: z.coerce.number().finite().gte(0).lte(65535),
    DATABASE_NAME: z.string().nonempty(),
    DATABASE_USERNAME: z.string().nonempty(),
    DATABASE_PASSWORD: z.string(),
    JWT_SECRET: z.string().nonempty(),
    EMAIL_FROM: z.string().nonempty().email(),
    EMAIL_SMTP_API_KEY: z.string().nonempty(),
})
    .parse(dotenv({ path: path.join(import.meta.dirname, "..", ".env") }).parsed);
const config = {
    port: env.PORT,
    appUrl: env.APP_URL,
    database: {
        host: env.DATABASE_HOST,
        port: env.DATABASE_PORT,
        name: env.DATABASE_NAME,
        username: env.DATABASE_USERNAME,
        password: env.DATABASE_PASSWORD,
        models: path.join(import.meta.dirname, "models", "*.{ts,js}"),
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
