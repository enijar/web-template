# Web Template

Opinionated template for building modern and scalable web projects.

### Getting Started

Set up a new project:

```shell
npx degit enijar/web-template project-name
cd project-name
```

Run project:

```shell
cp client/.env.example client/.env
cp server/.env.example server/.env
nvm use # uses supported Node version for this project
npm install
npm start
```

### Production Build

```shell
cp client/.env.example client/.env
cp server/.env.example server/.env
nvm use # uses supported Node version for this project
npm install
npm run build

# Install PM2 globally to manage the server process
npm add -g pm2

# Start the server process with pm2
pm2 start --name app server/build/index.js
```
