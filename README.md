# Web Template

A full-stack TypeScript template with React, Hono, and tRPC.

## Quickstart

Node 24 or newer; `.nvmrc` pins the version CI and pm2 use.

```shell
cp .env.example .env.local
npm install
npm start
```

This starts the client at `localhost:8080`, the server at `localhost:3000`, and the email previewer at
`localhost:9999`. The client proxies `/api` and `/trpc` to the server.

## Architecture

Third-party integrations follow a ports-and-adapters pattern so providers can be swapped, and faked in tests:

- `src/server/services` — provider-agnostic services. Each service is a `create*` factory that declares the
  interfaces it depends on (e.g. the email service needs an `EmailRenderer` and an `EmailTransport`, the auth service
  needs a `PasswordHasher`). Services never read env config directly.
- `src/server/adapters` — one file per provider, implementing a service interface (`sendgrid.ts`, `argon2.ts`,
  `console.ts`, ...). Swapping providers means writing a new adapter; services and actions don't change.
- `src/server/index.ts` — the composition root, and the only module that reads `config` at runtime. It decides which
  adapter each service uses (e.g. emails go to the console in development and SendGrid in production). `vite.config.ts`
  reads `config` too, at build time, for the dev proxy target and `BASE_PATH`.
- `createApp` passes the services (and `config`) to every tRPC action via context, so actions use
  `opts.ctx.email.send(...)` and tests can inject fakes.

The database is the deliberate exception: `createDatabase` is a factory (so tests can run an isolated in-memory
SQLite instance), but models are used directly in Active Record style — Sequelize itself is the abstraction over
database providers.

The client mirrors the same idea. `createApi` in `src/client/services/api.ts` builds the tRPC and React Query
clients and declares what it depends on: a `fetch` (so tests can route requests to an in-memory server) and an
`onUnauthorized` callback (so an expired or revoked session signs the user out everywhere, wherever the failure
surfaces). `src/client/index.tsx` is the client's composition root and wires those to the real network and app
state; it reads `import.meta.env.BASE_URL`, never `config`. Auth state transitions live in the `useAuth` hook
(`src/client/hooks/use-auth.ts`) — pages call `auth.login(...)`/`auth.register(...)`/`auth.logout()` and never touch
the user state directly.

Request bodies on `/trpc/*` are capped at 10 MB, matching `client_max_body_size` in the NGINX example below so the
proxy and the app reject the same payloads. tRPC buffers inputs into memory before handlers run, so every accepted
byte is resident: routes that need genuinely large bodies (e.g. file uploads) should take their own route-scoped
`bodyLimit` and stream the body rather than raising this cap.

`createApp` also serves `/api/health`, which runs `SELECT 1` and answers 503 when the database is unreachable.
Login, registration, and password-reset requests are rate limited per IP and per email. The default store
(`createMemoryRateLimitStore`) counts inside one process, so running more than one instance needs a shared store —
write a Redis adapter and pass it to `createRateLimiter`. The IP behind those keys comes from `x-real-ip` or the
rightmost `x-forwarded-for` entry while `TRUST_PROXY` is on; turn it off when the server faces the internet
directly, or a client can forge the header and get a fresh rate-limit bucket per request.

To add a service:

1. Define the service factory and its adapter interfaces in `src/server/services/<name>.ts`.
2. Implement a provider in `src/server/adapters/<provider>.ts`.
3. Add it to `AppServices` in `src/server/services/app.ts` and wire it up in `src/server/index.ts`.

## Testing

```shell
npm test
```

Vitest specs live in `src/test`, with shared fakes in `src/test/helpers.ts`, and run as two projects: `server`
(`*.test.ts`, node environment) and `client` (`*.test.tsx`, jsdom). Services are unit tested against fake
adapters, and `actions.test.ts` runs the full login and password-reset flows through a tRPC caller backed by an
in-memory SQLite database and an in-memory email transport.

Client specs render the real React app against the real server: `createApi` is given a `fetch` that routes
requests straight to `createApp`'s Hono instance and keeps session cookies like a browser, so `client.test.tsx`
covers register, login, logout, session revocation, and the full password-reset flow (including reading the reset
link out of the captured email) end to end without opening a socket.

## Environment Variables

`src/config/index.ts` validates every variable with Zod at import time, so a missing or malformed value fails the
build and the boot rather than the first request.

[Dotenvx](https://dotenvx.com/docs) stores encrypted variables in version control, which makes deployment and
sharing configs easier. Three files feed the schema:

- `.env.dev` — encrypted development values, committed. Loaded when `NODE_ENV=development`.
- `.env.prod` — encrypted production values, committed. Loaded otherwise.
- `.env.local` — your own plaintext overrides, git-ignored, loaded last and wins.

The template ships neither `.env.dev` nor `.env.prod`. Create each from `.env.example`, then encrypt it with
`npm run env:encrypt:dev` or `npm run env:encrypt:prod` before committing. `npm run env:decrypt:*` leaves the file
in plaintext, so encrypt it again before the next commit. `.env.keys` holds the private keys and must never be
committed.

## Production

```shell
npm run build
pm2 startOrReload ecosystem.config.cjs --time --update-env
```

The build parses `config` through `vite.config.ts`, so every variable must resolve at build time: from `.env.prod`
with its key at hand (`.env.keys` locally, `DOTENV_PRIVATE_KEY_PROD` in CI), from `.env.local`, or from the shell.
The built server reads `.env.prod` again at boot, resolved from the deploy root next to `build`.

`.github/workflows/ci.yml` type-checks, tests, and builds on the GitHub runner, rsyncs `build`, `node_modules`,
`package.json`, `ecosystem.config.cjs`, and `.nvmrc` to the server, then reloads pm2. It needs five repository
secrets: `DOTENV_PRIVATE_KEY_PROD`, `HOST`, `USERNAME`, `PRIVATE_KEY` (the SSH deploy key), and `DEPLOY_PATH`. The
workflow never copies `.env.prod` or `.env.keys`, so put those on the server yourself, or set the variables in
`ecosystem.config.cjs`.

Because `node_modules` is copied as-is, the runner and the server must share the same OS and CPU architecture so
native modules such as `argon2` stay compatible. If they differ, run `npm rebuild` on the server after syncing, or
change the workflow to run `npm ci` on the server instead.

Example NGINX config:

```nginx configuration
server {
    server_name _;
    listen 80;
    listen [::]:80;
    client_max_body_size 10m;

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
        proxy_pass http://localhost:3000;
    }
}
```

`client_max_body_size` matches the 10 MB `/trpc/*` cap, so a payload rejected by one is rejected by the other.
Raise both together, and only for routes that stream their own uploads. The proxy block sends no `Upgrade`/`Connection` headers because the template serves no
WebSockets — add them behind a `map $http_upgrade` when it does, so ordinary requests keep their keepalive.
