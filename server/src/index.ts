import config from "~/config.js";
import database from "~/services/database.js";
import app from "~/services/app.js";

(async () => {
  try {
    await database.sync({ alter: true });

    app.listen(config.port, () => {
      console.log(`Server running: http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
