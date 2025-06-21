import * as path from "node:path";
import { defineConfig, type UserConfigFn } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { config as dotenv } from "dotenv";
import z from "zod";

const env = z
  .object({
    PORT: z.coerce.number().finite().gte(0).lte(65535),
  })
  .parse(dotenv({ path: path.join(import.meta.dirname, "..", ".env") }).parsed);

const PROJECT_ROOT = path.resolve(__dirname);
const DEV_MODE = process.env.NODE_ENV === "development";

const config: UserConfigFn = () => {
  return defineConfig({
    server: {
      port: 8080,
      host: true,
      proxy: {
        "/trpc": {
          target: `http://localhost:${env.PORT}`,
        },
        "/api": {
          target: `http://localhost:${env.PORT}`,
        },
      },
    },
    base: "/",
    publicDir: path.join(PROJECT_ROOT, "public"),
    build: {
      outDir: path.join(PROJECT_ROOT, "build"),
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
};

export default config;
