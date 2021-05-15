import * as path from "path";
import env from "../env";

export default {
  port: env.port,
  appUrl: env.appUrl,
  bcryptRounds: env.bcryptRounds,
  database: {
    host: env.database.host,
    name: env.database.name,
    dialect: env.database.dialect,
    username: env.database.username,
    password: env.database.password,
    storage: env.database.storage,
    entities: path.resolve(__dirname, "entities"),
  },
  jwt: {
    secret: env.jwt.secret,
  },
};
