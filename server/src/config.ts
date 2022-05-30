import * as path from "path";
import env from "../env";
import User from "./entities/user";

const paths = {
  emails: path.resolve(__dirname, "..", "emails"),
};

export default {
  port: env.port,
  appUrl: env.appUrl,
  corsOrigins: env.corsOrigins,
  bcryptRounds: env.bcryptRounds,
  database: {
    host: env.database.host,
    name: env.database.name,
    dialect: env.database.dialect,
    username: env.database.username,
    password: env.database.password,
    storage: env.database.storage,
    entities: [User],
  },
  jwt: {
    secret: env.jwt.secret,
  },
  email: {
    preview: env.email.preview,
    send: env.email.send,
    from: env.email.from,
    templates: paths.emails,
    transport: {
      host: env.email.smtp.host,
      port: env.email.smtp.port,
      auth: {
        user: env.email.smtp.username,
        pass: env.email.smtp.password,
      },
    },
  },
};
