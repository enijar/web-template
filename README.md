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
cp client/env.example.ts client/env.ts
cp server/env.example.ts server/env.ts
nvm use # optional (uses the exact Node this project was tested against)
npm install
npm start
```

### Production Build

```shell
cp client/env.example.ts client/env.ts
cp server/env.example.ts server/env.ts
nvm use # optional (uses the exact Node this project was tested against)
npm install
npm run build

# Install PM2 globally to manage the server process
npm add -g pm2

# Start the server process with pm2
pm2 start --name app server/build/index.js
```

### NGINX Config

```nginx
server {
  listen 80;
  server_name _;

  # /api prefixed requests are forwarded onto the server
  location /api {
    proxy_redirect off;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://localhost:3000;
  }

  # All routes are handled by the client
  location / {
    index index.html;
    absolute_redirect off;
    root /var/www/app/client/build;
    try_files $uri $uri/ /index.html =404;
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
  }
}
```
