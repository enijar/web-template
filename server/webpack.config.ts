import * as path from "path";
const nodeExternals = require("webpack-node-externals");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");

const DEV_MODE = process.env.NODE_ENV === "development";
const SRC_DIR = path.resolve(__dirname, "src");
const BUILD_DIR = path.resolve(__dirname, "build");

const config = {
  mode: DEV_MODE ? "development" : "production",
  target: "node",
  stats: "minimal",
  devtool: DEV_MODE ? "eval-cheap-module-source-map" : "source-map",
  entry: path.join(SRC_DIR, "index.ts"),
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  plugins: [
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: ["node build/server.js"],
        blocking: false,
        parallel: true,
      },
    }),
  ],
  resolve: {
    extensions: [".ts", ".js"],
  },
  externals: [nodeExternals()],
  output: {
    filename: "server.js",
    path: BUILD_DIR,
    clean: true,
  },
};

export default () => {
  if (!DEV_MODE) {
    //
  }
  return config;
};
