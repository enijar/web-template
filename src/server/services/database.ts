import path from "node:path";
import { importModels, Sequelize } from "@sequelize/core";
import { MySqlDialect } from "@sequelize/mysql";
import { SqliteDialect } from "@sequelize/sqlite3";
import config from "config/index.js";

let database: Sequelize;

switch (config.DATABASE_DIALECT) {
  case "mysql":
    database = new Sequelize({
      dialect: MySqlDialect,
      url: config.DATABASE_URL,
    });
    break;
  default:
    database = new Sequelize({
      dialect: SqliteDialect,
      storage: config.DATABASE_URL.replace("sqlite3:", ""),
    });
}

database.addModels(await importModels(path.join(import.meta.dirname, "..", "models", "*.{ts,js}")));

export default database;
