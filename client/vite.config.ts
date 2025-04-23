import * as path from "node:path";
import { defineConfig, loadEnv, type UserConfigFn } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

const PROJECT_ROOT = path.resolve(__dirname);
const DEV_MODE = process.env.NODE_ENV === "development";

const config: UserConfigFn = (env) => {
  process.env = { ...process.env, ...loadEnv(env.mode, process.cwd()) };
  return defineConfig({
    server: {
      port: 8080,
      host: true,
      proxy: {
        "/trpc": {
          target: "http://localhost:3000",
        },
        "/api": {
          target: "http://localhost:3000",
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
