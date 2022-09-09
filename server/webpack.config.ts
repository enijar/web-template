import "dotenv/config";
import * as path from "path";
import * as webpack from "webpack";
import * as nodeExternals from "webpack-node-externals";

const NodemonPlugin = require("nodemon-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const DEV_MODE = process.env.NODE_ENV === "development";
const SRC_DIR = path.resolve(__dirname, "src");
const BUILD_DIR = path.resolve(__dirname, "build");

const config = {
  mode: DEV_MODE ? "development" : "production",
  target: "node",
  stats: "minimal",
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
      "process.env.PORT": JSON.stringify(process.env.PORT),
      "process.env.APP_URL": JSON.stringify(process.env.APP_URL),
      "process.env.CORS_ORIGINS": JSON.stringify(process.env.CORS_ORIGINS),
      "process.env.BCRYPT_ROUNDS": JSON.stringify(process.env.BCRYPT_ROUNDS),
      "process.env.DATABASE_HOST": JSON.stringify(process.env.DATABASE_HOST),
      "process.env.DATABASE_NAME": JSON.stringify(process.env.DATABASE_NAME),
      "process.env.DATABASE_DIALECT": JSON.stringify(
        process.env.DATABASE_DIALECT
      ),
      "process.env.DATABASE_USERNAME": JSON.stringify(
        process.env.DATABASE_USERNAME
      ),
      "process.env.DATABASE_PASSWORD": JSON.stringify(
        process.env.DATABASE_PASSWORD
      ),
      "process.env.JWT_SECRET": JSON.stringify(process.env.JWT_SECRET),
      "process.env.EMAIL_PREVIEW": JSON.stringify(process.env.EMAIL_PREVIEW),
      "process.env.EMAIL_SEND": JSON.stringify(process.env.EMAIL_SEND),
      "process.env.EMAIL_FROM": JSON.stringify(process.env.EMAIL_FROM),
      "process.env.EMAIL_SMTP_HOST": JSON.stringify(
        process.env.EMAIL_SMTP_HOST
      ),
      "process.env.EMAIL_SMTP_PORT": JSON.stringify(
        process.env.EMAIL_SMTP_PORT
      ),
      "process.env.EMAIL_SMTP_USERNAME": JSON.stringify(
        process.env.EMAIL_SMTP_USERNAME
      ),
      "process.env.EMAIL_SMTP_PASSWORD": JSON.stringify(
        process.env.EMAIL_SMTP_PASSWORD
      ),
    }),
    new NodemonPlugin(),
    new ForkTsCheckerWebpackPlugin(),
  ],
  resolve: {
    plugins: [new TsconfigPathsPlugin({})],
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
  if (!DEV_MODE) {
    // Modify config for production
  }
  return config;
};
