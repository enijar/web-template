# AGENTS.md

This file provides context and instructions for AI coding agents working on this project.

## Project Overview

A full-stack TypeScript web application template with a React frontend and Hono backend, using tRPC for type-safe API communication.

## Architecture

```
src/
├── client/     # React frontend (Vite, styled-components, TanStack Query, Zustand)
├── server/     # Hono backend (tRPC, Sequelize ORM)
├── config/     # Shared configuration
└── emails/     # React Email templates
```

- **Frontend**: React 19, Vite, styled-components, React Router, TanStack Query, Zustand
- **Backend**: Hono (Node.js), tRPC for API, Sequelize ORM
- **Database**: SQLite (default) or MySQL
- **Email**: React Email with SendGrid

## Build and Test Commands

```bash
npm install          # Install dependencies
npm start            # Start dev mode (client + server + emails concurrently)
npm run build        # Production build (client + server)
npm run check        # TypeScript type checking (tsc --noEmit)
npm run format       # Format all code with Prettier
```

Individual commands:
- `npm run start:client` - Vite dev server
- `npm run start:server` - Backend with hot reload (tsx --watch)
- `npm run start:emails` - Email preview server (port 9999)
- `npm run build:client` - Vite production build
- `npm run build:server` - TypeScript compile server code

## Code Style

- **Formatter**: Prettier
- **Indentation**: 2 spaces
- **Line endings**: LF
- **Max line length**: 120 characters
- **TypeScript**: Strict mode enabled
- **Module system**: ESM (`"type": "module"`)

Run `npm run format` before committing changes.

## Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:

```typescript
import { something } from 'client/components/something.js'
import { config } from 'config/app.js'
import { UserModel } from 'server/models/user.js'
import { WelcomeEmail } from 'emails/welcome.js'
```

**Note**:
- All file names must use `kebab-case.js` format
- The `.js` extension is required for all imports (ESM requirement), even though source files are `.ts`

## Environment Variables

Copy `.env.example` to `.env` for local development. Key variables:

- `PORT` - Server port (default: 3000)
- `APP_URL` - Frontend URL
- `DATABASE_DIALECT` - `sqlite3` or `mysql`
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Secret for JWT tokens
- `EMAIL_FROM` - Sender email address
- `EMAIL_SMTP_API_KEY` - SendGrid API key

## Development Notes

- The client runs on Vite's dev server (default port 8080)
- The server runs on the configured `PORT` (default 3000)
- API routes are prefixed with `/api` or `/trpc`
- Static files are served from `public/`
- Production builds output to `build/client` and `build/server`

## Testing

Currently, no test suite is configured (`npm test` exits with 0). When adding tests, update this section.
