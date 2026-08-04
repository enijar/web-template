# Web Template

A full-stack TypeScript template with React, Hono, and tRPC.

## Quickstart

```shell
cp .env.example .env.local
npm install
npm start
```

This starts the client at `localhost:8080` and the server at `localhost:3000`.

## Architecture

Third-party integrations follow a ports-and-adapters pattern so providers can be swapped, and faked in tests:

- `src/server/services` — provider-agnostic services. Each service is a `create*` factory that declares the
  interfaces it depends on (e.g. the email service needs an `EmailRenderer` and an `EmailTransport`, the auth service
  needs a `PasswordHasher`). Services never read env config directly.
- `src/server/adapters` — one file per provider, implementing a service interface (`sendgrid.ts`, `argon2.ts`,
  `console.ts`, ...). Swapping providers means writing a new adapter; services and actions don't change.
- `src/server/index.ts` — the composition root, and the only module that reads `config` at runtime. It decides which
  adapter each service uses (e.g. emails go to the console in development and SendGrid in production).
- `createApp` passes the services (and `config`) to every tRPC action via context, so actions use
  `opts.ctx.email.send(...)` and tests can inject fakes.

The database is the deliberate exception: `createDatabase` is a factory (so tests can run an isolated in-memory
SQLite instance), but models are used directly in Active Record style — Sequelize itself is the abstraction over
database providers.

Request bodies on `/trpc/*` are capped at 1 MB because tRPC buffers inputs into memory before handlers run. If you
add routes that need large bodies (e.g. file uploads), give them their own route-scoped `bodyLimit` and stream the
body rather than buffering it.

To add a service:

1. Define the service factory and its adapter interfaces in `src/server/services/<name>.ts`.
2. Implement a provider in `src/server/adapters/<provider>.ts`.
3. Add it to `AppServices` in `src/server/services/app.ts` and wire it up in `src/server/index.ts`.

## Testing

```shell
npm test
```

Vitest specs live in `src/test`, with shared fakes in `src/test/helpers.ts`. Services are unit tested against fake
adapters, and `actions.test.ts` runs the full login and password-reset flows through a tRPC caller backed by an
in-memory SQLite database and an in-memory email transport.

## Environment Variables

[Dotenvx](https://dotenvx.com/docs) is used for storing encrypted environment variables in version control. This makes
deployment and sharing configs easier. Ensure .env.keys is never committed, and that when decrypting the .env.\* files,
they are encrypted before committing them. Use .env.local to override existing variables with your own values.

## Production

```shell
npm run build
pm2 startOrReload ecosystem.config.cjs --time --update-env
```

The CI workflow builds on the GitHub runner, rsyncs `build` and `node_modules` to the server, then reloads pm2. Because `node_modules` is copied as-is, the runner and the server must share the same OS and CPU architecture so native modules such as `argon2` stay compatible. If they differ, run `npm rebuild` on the server after syncing, or change the workflow to run `npm ci` on the server instead.

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
