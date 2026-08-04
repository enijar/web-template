import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      client: path.join(import.meta.dirname, "src", "client"),
      config: path.join(import.meta.dirname, "src", "config"),
      emails: path.join(import.meta.dirname, "src", "emails"),
      server: path.join(import.meta.dirname, "src", "server"),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "server",
          environment: "node",
          include: ["src/test/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "client",
          environment: "jsdom",
          include: ["src/test/**/*.test.tsx"],
          setupFiles: ["src/test/setup.client.ts"],
        },
      },
    ],
  },
});
