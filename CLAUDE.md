# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Setup
```bash
cp .env.example .env
npm install
```

### Development Mode
```bash
npm start  # Runs client (port 8080), server (port 3000), and email preview (port 9999) concurrently
npm run start:client  # Vite dev server only
npm run start:server  # Server with tsx watch mode
npm run start:emails  # React Email preview server
```

### Production Build
```bash
npm run build  # Builds both client and server
npm run build:client  # Vite build for client only
npm run build:server  # TypeScript compilation for server with tsc-alias
```

### Testing
```bash
npm test  # Currently exits 0 (no tests configured)
```

## Architecture Overview

### Monorepo Structure
This is a full-stack TypeScript monorepo with client and server code in the same repository under `src/`:
- `src/client/` - React SPA with Vite
- `src/server/` - Node.js backend with Hono and tRPC
- `src/config/` - Shared configuration validated with Zod
- `src/emails/` - React Email templates

### Path Aliases
TypeScript path aliases are configured in tsconfig.json:
- `client/*` → `src/client/*`
- `server/*` → `src/server/*`
- `config/*` → `src/config/*`
- `emails/*` → `src/emails/*`

Use these aliases consistently throughout the codebase.

### Build System
Two separate TypeScript configurations:
- `tsconfig.json` - Client-side code (noEmit: true, used by Vite)
- `tsconfig.server.json` - Server-side code (module: NodeNext, outputs to `build/`)

Client build uses Vite → `build/client/`
Server build uses tsc + tsc-alias → `build/server/` and `build/config/`

### Backend Architecture (Hono + tRPC)

**Server Entry**: `src/server/index.ts`
- Syncs database with `{ alter: true }`
- Starts Hono server on port 3000

**Router Pattern**: `src/server/router.ts`
- Dynamically imports action modules from `src/server/actions/`
- Each action module exports tRPC procedures
- Type-safe router exported as `Router` type for client

**App Setup**: `src/server/services/app.ts`
- Hono app with CORS
- tRPC server mounted at `/trpc/*`
- Context created per-request via `createContext()`

**Adding New Endpoints**:
1. Create file in `src/server/actions/` with exported tRPC procedures
2. Import in `src/server/router.ts` using dynamic import pattern
3. Client will automatically have types via `Router` type export

### Frontend Architecture (React + tRPC)

**Entry Point**: `src/client/index.tsx`
- React Query + tRPC client setup
- tRPC client uses `/trpc` endpoint (proxied by Vite in dev)

**Client tRPC Setup**: `src/client/services/trpc.ts`
- Imports `Router` type from `server/router`
- Creates type-safe tRPC React hooks

**Routing**: React Router v7 configured in `src/client/router.tsx`

**State Management**: Zustand store in `src/client/state/app-state.ts`

**Styling**: styled-components with babel plugin for SSR-ready output

### Database (Sequelize v7)

**Connection**: `src/server/services/database.ts`
- MySQL dialect
- Auto-imports models from `src/server/models/*.{ts,js}`
- Database credentials from config

**Models**: Use Sequelize v7 decorator syntax
- Located in `src/server/models/`
- Example: `User` model with `@Table`, `@Attribute`, `@PrimaryKey` decorators

### Authentication

**JWT Service**: `src/server/services/auth.ts`
- `auth.sign(user)` - Creates 30-day JWT
- `auth.verify(token)` - Verifies and decodes JWT
- Uses HS256 algorithm with secret from config

### Email System

**Service**: `src/server/services/email.ts`
- SendGrid integration
- `email.send(reactElement, mailData)` - Renders React Email component and sends

**Templates**: `src/emails/`
- React components using @react-email/components
- Preview at http://localhost:9999 with `npm run start:emails`

### Configuration Management

**Config**: `src/config/index.ts`
- Loads `.env` file from project root
- Validates all variables with Zod schema
- Transforms JWT_SECRET to Uint8Array for jose library
- Accessed as default export: `import config from "config/index.js"`

Required environment variables:
- PORT, APP_URL
- DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD
- JWT_SECRET
- EMAIL_FROM, EMAIL_SMTP_API_KEY

### Development vs Production

**Development**:
- Vite dev server on port 8080 proxies `/api` and `/trpc` to server on port 3000
- tsx watch mode for server hot reload
- styled-components displays component names and file names

**Production**:
- Static client files served by NGINX from `build/client/`
- `/api` and `/trpc` requests proxied to Node.js server on port 3000
- Server runs via PM2: `pm2 start --name app build/server/index.js`
- styled-components minified with no debug info

### Module System

All code uses ES modules (`"type": "module"` in package.json):
- Use `.js` extensions in imports even for `.ts` files (TypeScript/Node.js convention)
- Server imports use path aliases, resolved at runtime by compiled output
