# Web Template

A full-stack TypeScript template with React, Hono, and tRPC.

## Quickstart

```shell
cp .env.example .env.local
npm install
npm start
```

This starts the client at `localhost:8080` and the server at `localhost:3000`.

## Environment Variables

[Dotenvx](https://dotenvx.com/docs) is used for storing encrypted environment variables in version control. This makes
deployment and sharing configs easier. Ensure .env.keys is never committed, and that when decrypting the .env.\* files,
they are encrypted before committing them. Use .env.local to override existing variables with your own values.

## Production

```shell
npm run build
pm2 start --name app build/server/index.js
```

Example NGINX config:

```nginx configuration
server {
    server_name _;
    listen 80;
    listen [::]:80;
    client_max_body_size 500m;

    index index.html;
    root /var/www/project-name/build/client;

    location / {
        try_files $uri $uri/ /index.html =404;
    }

    location ~ ^/(api|trpc) {
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_pass http://localhost:3000;
    }
}
```
