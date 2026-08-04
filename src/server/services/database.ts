import path from "node:path";
import { Sequelize, type ModelStatic } from "@sequelize/core";
import { MySqlDialect } from "@sequelize/mysql";
import { SqliteDialect } from "@sequelize/sqlite3";

export type DatabaseOptions = {
  dialect: "sqlite3" | "mysql";
  url: string;
  models: ModelStatic[];
};

export type DatabaseService = Sequelize;

function resolveSqliteStorage(url: string) {
  const storage = url.replace(/^sqlite3:/, "");
  if (storage === ":memory:" || path.isAbsolute(storage)) {
    return storage;
  }
  return path.join(import.meta.dirname, "..", "..", "..", storage);
}

export function createDatabase(options: DatabaseOptions): DatabaseService {
  let database: Sequelize;
  switch (options.dialect) {
    case "mysql":
      database = new Sequelize({
        dialect: MySqlDialect,
        url: options.url,
        ssl: options.url.match(/[?&]ssl=true/) ? { rejectUnauthorized: true } : undefined,
      });
      break;
    default: {
      const storage = resolveSqliteStorage(options.url);
      database = new Sequelize({
        dialect: SqliteDialect,
        storage,
        pool: storage === ":memory:" ? { max: 1, idle: Infinity, maxUses: Infinity } : undefined,
      });
    }
  }
  database.addModels(options.models);
  return database;
}
