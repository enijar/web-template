import { serve } from "@hono/node-server";
import database from "server/services/database.js";
import app from "server/services/app.js";
import config from "config/index.js";

try {
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
