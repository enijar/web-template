import path from "node:path";
import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import config from "../config/src";

const DEV_MODE = process.env.NODE_ENV === "development";
const SERVER_URL = `http://localhost:${config.port}`;

export default function (): UserConfig {
  return defineConfig({
    server: {
      port: 8080,
      host: true,
      proxy: {
        "/trpc": {
          target: SERVER_URL,
        },
        "/api": {
          target: SERVER_URL,
        },
      },
    },
    base: "/",
    publicDir: path.join(import.meta.dirname, "public"),
    build: {
      outDir: path.join(import.meta.dirname, "build"),
      emptyOutDir: true,
    },
    esbuild: {
      legalComments: "none",
    },
    appType: "spa",
    root: "src",
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
