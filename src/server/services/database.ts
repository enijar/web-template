import path from "node:path";
import { importModels, Sequelize } from "@sequelize/core";
import { MySqlDialect } from "@sequelize/mysql";
import config from "config/index.js";

const database = new Sequelize({
  dialect: MySqlDialect,
  host: config.DATABASE_HOST,
  port: config.DATABASE_PORT,
  database: config.DATABASE_NAME,
  user: config.DATABASE_USERNAME,
  password: config.DATABASE_PASSWORD,
  models: await importModels(path.join(import.meta.dirname, "..", "models", "*.{ts,js}")),
});

export default database;
