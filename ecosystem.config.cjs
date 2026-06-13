const fs = require("node:fs");
const path = require("node:path");

const interpreter = path.join(
  process.env.HOME,
  ".nvm",
  "versions",
  "node",
  `v${fs.readFileSync(path.join(__dirname, ".nvmrc"), "utf-8").trim().replace(/^v/, "")}`,
  "bin",
  "node",
);

module.exports = {
  apps: [
    {
      name: `${path.basename(__dirname)}-server`,
      cwd: path.join(__dirname, "build"),
      script: path.join("server", "index.js"),
      exec_mode: "cluster",
      instances: 1,
      interpreter,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
