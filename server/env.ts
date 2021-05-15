import * as path from "path";
import { Dialect } from "sequelize";

export default {
  port: 3000,
  appUrl: "http://localhost:8080",
  bcryptRounds: 12,
  database: {
    host: `localhost`,
    name: `cll-world`,
    dialect: `sqlite` as Dialect,
    username: `cll-world`,
    password: `secret`,
    storage: path.resolve(__dirname, ".cache", "database.sqlite"),
  },
};
