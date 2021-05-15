const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ReactRefreshTypeScript = require("react-refresh-typescript");

const DEV_MODE = process.env.NODE_ENV === "development";
const SRC_DIR = path.resolve(__dirname, "src");
const PUBLIC_DIR = path.resolve(__dirname, "public");
const BUILD_DIR = path.resolve(__dirname, "build");
const CACHE_DIR = path.resolve(__dirname, "node_modules", ".cache");

module.exports = {
  target: "browserslist",
  stats: "minimal",
  devtool: DEV_MODE ? "eval-cheap-module-source-map" : "source-map",
  entry: path.join(SRC_DIR, "index.tsx"),
  devServer: {
    historyApiFallback: true,
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
          {
            loader: "@linaria/webpack-loader",
            options: {
              sourceMap: DEV_MODE,
              cacheDirectory: path.join(CACHE_DIR, ".linaria"),
              displayName: DEV_MODE,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: DEV_MODE,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(PUBLIC_DIR, "index.html"),
      filename: "index.html",
      inject: "body",
    }),
    new HtmlInlineScriptPlugin([/main.+[.]js$/]),
    new CopyPlugin({
      patterns: [
        {
          from: PUBLIC_DIR,
          to: BUILD_DIR,
          globOptions: {
            ignore: [path.join(PUBLIC_DIR, "index.html")],
          },
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash:8].css",
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name].[contenthash:8].js",
    chunkFilename: "[name].[contenthash:8].chunk.js",
    path: BUILD_DIR,
    clean: true,
    publicPath: "/",
  },
};
