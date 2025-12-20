import path from "node:path";
import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import config from "./src/config/index.js";

const DEV_MODE = process.env.NODE_ENV === "development";
const SERVER_URL = `http://localhost:${config.PORT}`;

export default function (): UserConfig {
  return defineConfig({
    server: {
      port: 8080,
      host: true,
      proxy: {
        "/api": {
          target: SERVER_URL,
        },
        "/trpc": {
          target: SERVER_URL,
        },
      },
    },
    base: config.BASE_PATH,
    publicDir: path.join(import.meta.dirname, "public"),
    build: {
      outDir: path.join(import.meta.dirname, "build", "client"),
      emptyOutDir: true,
    },
    esbuild: {
      legalComments: "none",
    },
    appType: "spa",
    root: path.join("src", "client"),
    clearScreen: false,
    plugins: [
      tsconfigPaths(),
      react({
        include: /\.(tsx?)$/,
        babel: {
          plugins: [
            [
              "babel-plugin-styled-components",
              {
                ssr: !DEV_MODE,
                fileName: DEV_MODE,
                displayName: DEV_MODE,
                minify: !DEV_MODE,
                pure: !DEV_MODE,
              },
            ],
          ],
        },
      }),
    ],
  });
}
