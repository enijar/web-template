# Web Template

Opinionated template for building modern and scalable web projects.

## Set up

Set up environment variables and install dependencies:

```shell
cp .env.example .env
npm install
```

## Development

Start the client (localhost:8080) and server (localhost:3000):

```shell
npm start
```

## Production Build

Build app in production mode:

```shell
npm run build
```

Run app in production:

```shell
# Install PM2 globally to manage the server process
npm add -g pm2
pm2 start --name app build/server/index.js
```

NGINX config:

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
