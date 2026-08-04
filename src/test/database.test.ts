import { afterAll, describe, expect, it } from "vitest";
import { createDatabase } from "server/services/database.js";
import models from "server/models/index.js";
import User from "server/models/user.js";

const database = createDatabase({ dialect: "sqlite3", url: "sqlite3::memory:", models });

afterAll(async () => {
  await database.close();
});

describe("database service", () => {
  it("runs an isolated in-memory database with the app models", async () => {
    await database.sync();
    const user = await User.create({ email: "user@example.com", password: "hash" });
    expect(user.id).toBe(1);
    expect(await User.count()).toBe(1);
    const found = await User.findOne({ where: { email: "user@example.com" } });
    expect(found?.id).toBe(user.id);
  });
});
