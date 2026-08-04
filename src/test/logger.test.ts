import { describe, expect, it, vi } from "vitest";
import { consoleLogger } from "server/adapters/console.js";
import { jsonLogger } from "server/adapters/json.js";

describe("consoleLogger", () => {
  it("forwards messages and meta to the console", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    consoleLogger.info("hello", { userId: 1 });
    consoleLogger.info("plain");
    expect(info).toHaveBeenNthCalledWith(1, "hello", { userId: 1 });
    expect(info).toHaveBeenNthCalledWith(2, "plain");
    info.mockRestore();
  });
});

describe("jsonLogger", () => {
  it("writes one json object per line with errors serialized", () => {
    const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    jsonLogger.error("boom", { error: new Error("broken") });
    expect(write).toHaveBeenCalledTimes(1);
    const line = write.mock.calls[0][0] as string;
    expect(line.endsWith("\n")).toBe(true);
    const entry = JSON.parse(line);
    expect(entry).toMatchObject({ level: "error", message: "boom" });
    expect(entry.error.message).toBe("broken");
    expect(typeof entry.time).toBe("string");
    write.mockRestore();
  });
});
