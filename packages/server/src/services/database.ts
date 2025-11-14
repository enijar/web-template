import { importModels, Sequelize } from "@sequelize/core";
import { MySqlDialect } from "@sequelize/mysql";
import config from "config/index.js";

const database = new Sequelize({
  dialect: MySqlDialect,
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.username,
  password: config.database.password,
  models: await importModels(config.database.models),
});

export default database;
