# TechVerse — AI-Powered Developer Platform

## Overview

TechVerse is a large-scale, AI-powered, fully animated web platform combining a developer portfolio, service marketplace, client management system, and intelligent AI assistant.

## Architecture

pnpm workspace monorepo with the following packages:

| Package | Path | Description |
|---|---|---|
| `@workspace/api-server` | `artifacts/api-server` | Express 5 REST API with Clerk auth + PostgreSQL |
| `@workspace/techverse` | `artifacts/techverse` | React + Vite frontend with Framer Motion |
| `@workspace/db` | `lib/db` | Drizzle ORM schema + migrations |
| `@workspace/api-spec` | `lib/api-spec` | OpenAPI spec + Orval codegen config |
| `@workspace/api-client-react` | `lib/api-client-react` | Generated React Query hooks from OpenAPI |
| `@workspace/api-zod` | `lib/api-zod` | Generated Zod schemas from OpenAPI |
| `@workspace/integrations-openai-ai-server` | `lib/integrations-openai-ai-server` | OpenAI client for server-side use |
| `@workspace/integrations-openai-ai-react` | `lib/integrations-openai-ai-react` | OpenAI React hooks |

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24
- **API Framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Clerk (via `@clerk/express` + `@clerk/react`)
- **AI**: OpenAI GPT via Replit AI Proxy (SSE streaming)
- **Frontend**: React 19 + Vite + Framer Motion + Tailwind CSS v4
- **API codegen**: Orval (OpenAPI → React Query hooks + Zod schemas)
- **Design**: Dark electric/cyberpunk theme (Space Grotesk/Mono fonts, cyan/purple accents)

## Database Schema

Tables: `users`, `projects`, `services`, `bookings`, `chat_conversations`, `chat_messages`, `notifications`, `reviews`, `conversations` (AI), `messages` (AI)

## Pages / Routes

| Route | Description |
|---|---|
| `/` | Landing page (public) |
| `/sign-in`, `/sign-up` | Clerk auth |
| `/dashboard` | Command Center — stats, recent activity |
| `/portfolio` | Projects showcase |
| `/marketplace` | Service listings with category filter |
| `/bookings` | Booking management (client/provider views) |
| `/chat` | Direct messaging between users |
| `/ai-assistant` | AI chat with SSE streaming (OpenAI GPT) |
| `/notifications` | Alerts & notifications |
| `/settings` | Profile configuration |
| `/admin` | Admin dashboard (stats, users, activity) |

## API Endpoints

All under `/api`:
- `GET/PUT /users/me` — profile
- `GET /users/stats` — user statistics
- `GET/POST/PUT/DELETE /projects` — project CRUD
- `GET /projects/featured` — featured projects
- `GET/POST/PUT/DELETE /services` — service CRUD
- `GET /services/categories` — service categories
- `GET/POST/PUT /bookings` — booking management
- `GET/POST /conversations` — user chat conversations
- `GET/POST /conversations/:id/messages` — chat messages
- `GET /notifications` + mark read endpoints
- `GET/POST /reviews` — reviews
- `GET /admin/stats`, `/admin/users`, `/admin/recent-activity`
- `GET/POST /openai/conversations` — AI conversations
- `GET/POST /openai/conversations/:id/messages` — AI chat (SSE streaming)

## Key Commands

```bash
# Run API server
pnpm --filter @workspace/api-server run dev

# Run frontend
pnpm --filter @workspace/techverse run dev

# Push DB schema
pnpm --filter @workspace/db run push

# Seed database
pnpm --filter @workspace/db run seed

# Regenerate API client from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

## Important Notes

- **Orval codegen fix**: The `lib/api-spec/package.json` codegen script restores `lib/api-zod/src/index.ts` after orval runs (orval overwrites it with a non-existent `./generated/api.schemas` export). Do NOT revert this.
- **Clerk auth**: Uses `clerkMiddleware()` from `@clerk/express`. The `requireAuth` middleware extracts `userId` from session. Clerk proxy middleware only activates in production.
- **AI chat**: Uses SSE streaming — the route returns `text/event-stream` and streams chunks. The frontend reads via `ReadableStream`.
- **DB seed data**: Demo users (demo_alice, demo_bob, demo_carol), 6 projects, 7 services are pre-seeded.
