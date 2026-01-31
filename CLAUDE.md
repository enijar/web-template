# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack TypeScript web template with React 19 + Vite frontend and Hono + tRPC backend. Uses Sequelize ORM with SQLite3/MySQL, Zustand for client state, and React Email with SendGrid for email.

## Commands

```bash
npm start                 # Runs client (8080) + server (3000) + email preview (9999) concurrently
npm run check             # TypeScript type checking (tsc --noEmit)
npm run format            # Prettier formatting
npm run build             # Production build (client + server)
npm run start:client      # Vite dev server only
npm run start:server      # Backend with tsx --watch
npm run start:emails      # Email preview server
```

## Architecture

```
┌─────────────────────────────────────┐
│  React 19 + Vite (localhost:8080)   │
│  TanStack Query + tRPC Client       │
│  Zustand state, Styled Components   │
└─────────────────────────────────────┘
                ↓ /api, /trpc
┌─────────────────────────────────────┐
│  Hono Server (localhost:3000)       │
│  tRPC Router for type-safe RPC      │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Sequelize ORM (SQLite3/MySQL)      │
│  Password hashing with Argon2       │
│  JWT auth with jose library         │
└─────────────────────────────────────┘
```

## Source Structure

- `src/client/` - React frontend (components, pages, services, state, router)
- `src/server/` - Hono backend (actions, models, services, router)
- `src/config/` - Environment config with Zod validation
- `src/emails/` - React Email templates

## Key Patterns

- **tRPC mutations** accept FormData and validate with Zod schemas
- **Styled Components** co-located as `.style.ts` files next to components
- **Database models** in `src/server/models/` auto-loaded by Sequelize service
- **Path aliases**: `client/*`, `server/*`, `config/*`, `emails/*` map to `src/` subdirs

## Environment

Uses dotenvx for encrypted environment variables. Copy `.env.example` to `.env.local` for development. Required variables defined in `src/config/index.ts`.
