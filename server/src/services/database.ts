import { Sequelize } from "sequelize-typescript";
import config from "../config";

export default new Sequelize({
  host: config.database.host,
  database: config.database.name,
  dialect: config.database.dialect,
  username: config.database.username,
  password: config.database.password,
  storage: config.database.storage,
  logging: false,
  models: config.database.entities,
});
