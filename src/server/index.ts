import { serve } from "@hono/node-server";
import { createApp } from "server/services/app.js";
import { createAuthService } from "server/services/auth.js";
import { createDatabase } from "server/services/database.js";
import { createEmailService } from "server/services/email.js";
import { createRateLimiter } from "server/services/rate-limiter.js";
import { argon2Hasher } from "server/adapters/argon2.js";
import { reactEmailRenderer } from "server/adapters/react-email.js";
import { createSendgridTransport } from "server/adapters/sendgrid.js";
import { consoleLogger, consoleTransport } from "server/adapters/console.js";
import { jsonLogger } from "server/adapters/json.js";
import { createMemoryRateLimitStore } from "server/adapters/memory.js";
import models from "server/models/index.js";
import config from "config/index.js";

const logger = config.NODE_ENV === "development" ? consoleLogger : jsonLogger;

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
  const rateLimiter = createRateLimiter({ store: createMemoryRateLimitStore() });
  const app = createApp({ config, auth, database, email, logger, rateLimiter });
  await database.sync({ alter: true });
  const server = serve({ ...app, port: config.PORT });
  server.on("error", (err) => {
    logger.error("Server error", { error: err });
  });
  server.on("listening", () => {
    logger.info(`Server running: http://localhost:${config.PORT}`);
  });
  let shuttingDown = false;
  function shutdown(signal: NodeJS.Signals) {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    logger.info(`Received ${signal}, shutting down`);
    setTimeout(() => process.exit(1), 10_000).unref(); // force-exit if connections refuse to drain
    server.close(async (err) => {
      if (err !== undefined) {
        logger.error("Error while closing server", { error: err });
      }
      try {
        await database.close();
      } catch (closeErr) {
        logger.error("Error while closing database", { error: closeErr });
        process.exit(1);
      }
      process.exit(err === undefined ? 0 : 1);
    });
    if ("closeIdleConnections" in server) {
      server.closeIdleConnections();
    }
  }
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
} catch (err) {
  logger.error("Server failed to start", { error: err });
  process.exit(1);
}
