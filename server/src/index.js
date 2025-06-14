import { serve } from "@hono/node-server";
import config from "~/config.js";
import database from "~/services/database.js";
import app from "~/services/app.js";
database
    .sync({ alter: true })
    .then(() => {
    const server = serve({ ...app, port: config.port });
    server.on("error", (err) => {
        console.error(err);
    });
    server.on("listening", async () => {
        console.log(`Server running: http://localhost:${config.port}`);
    });
})
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
