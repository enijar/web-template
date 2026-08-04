import { serve } from "@hono/node-server";
import { createApp } from "server/services/app.js";
import { createAuthService } from "server/services/auth.js";
import { createDatabase } from "server/services/database.js";
import { createEmailService } from "server/services/email.js";
import { argon2Hasher } from "server/adapters/argon2.js";
import { reactEmailRenderer } from "server/adapters/react-email.js";
import { createSendgridTransport } from "server/adapters/sendgrid.js";
import { consoleTransport } from "server/adapters/console.js";
import models from "server/models/index.js";
import config from "config/index.js";

try {
  const database = createDatabase({
    dialect: config.DATABASE_DIALECT,
    url: config.DATABASE_URL,
    models,
  });
  const auth = createAuthService({
    secret: config.JWT_SECRET,
    secureCookies: config.APP_URL.startsWith("https"),
    hasher: argon2Hasher,
  });
  const email = createEmailService({
    renderer: reactEmailRenderer,
    transport:
      config.NODE_ENV === "development" ? consoleTransport : createSendgridTransport(config.EMAIL_SMTP_API_KEY),
    defaultFrom: config.EMAIL_FROM,
  });
  const app = createApp({ config, auth, database, email });
  await database.sync({ alter: true });
  const server = serve({ ...app, port: config.PORT });
  server.on("error", (err) => {
    console.error(err);
  });
  server.on("listening", async () => {
    console.log(`Server running: http://localhost:${config.PORT}`);
  });
} catch (err) {
  console.error(err);
  process.exit(1);
}
