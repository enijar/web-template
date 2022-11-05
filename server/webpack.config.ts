import * as dotenv from "dotenv";
import * as path from "path";
import * as webpack from "webpack";
import * as nodeExternals from "webpack-node-externals";

const NodemonPlugin = require("nodemon-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

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
        use: ["ts-loader"],
      },
    ],
  },
  plugins: [
    // Add ENV_VARS here to make them available inside the app
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(dotenv.config().parsed),
    }),
    new NodemonPlugin(),
    new ForkTsCheckerWebpackPlugin(),
  ],
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "index.js",
    path: BUILD_DIR,
    clean: true,
  },
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  optimization: {
    minimize: false,
  },
};

export default () => {
  // Production config
  if (!DEV_MODE) {
    // Modify config for production
  }
  return config;
};
