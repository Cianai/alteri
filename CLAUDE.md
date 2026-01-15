# Alignment Comparator

A conversational research platform comparing AI alignment frameworks (Microsoft HSI vs Anthropic Constitutional AI) through Buddhist ethics evaluation methodology.

## Documentation-First Development

**ALWAYS use Context7 MCP before writing code that involves these libraries:**
- Next.js (App Router, Server Components, Route Handlers)
- Vercel AI SDK (streaming, useChat, generateText)
- XState v5 (machines, actors, guards, actions)
- Supabase (client, RLS, realtime, auth)
- shadcn/ui components
- React 19+ features

When implementing any feature, first query Context7 with the library name and specific API you need. This ensures you're using current patterns rather than outdated training data. The query format should target the specific capability, e.g., "XState v5 invoke actors" or "Vercel AI SDK streamText with tools".

## Project Context

This platform serves two personas:
- **Participants**: Complete guided elicitation flows, view personal results
- **Researchers**: Access aggregated data, framework comparison tools, export capabilities

Academic context: Masters dissertation research on AI-mediated psychological research methodology.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ with App Router (Turborepo monorepo) |
| AI | Vercel AI SDK 4.0 (streaming, multi-turn, function calling) |
| State | XState v5 (conversation flow orchestration) |
| Database | Supabase (PostgreSQL, Auth, Row Level Security) |
| Styling | Tailwind CSS, shadcn/ui components |
| Testing | Vitest (unit), Playwright (E2E) |

## Monorepo Structure

```
alignment-comparator/
├── apps/
│   └── web/                    # Next.js application
│       ├── app/                # App Router pages and API routes
│       ├── components/         # React components
│       └── lib/                # App-specific utilities
├── packages/
│   ├── shared/                 # Cross-package types and utilities
│   ├── state-machines/         # XState conversation flows
│   ├── database/               # Supabase client and types
│   └── ai/                     # Vercel AI SDK patterns and prompts
├── turbo.json                  # Turborepo task configuration
└── pnpm-workspace.yaml         # Workspace definition
```

## Commands

```bash
pnpm dev              # Start all packages in dev mode
pnpm build            # Build all packages
pnpm test             # Run Vitest across packages
pnpm typecheck        # TypeScript validation
pnpm db:generate      # Generate Supabase types
pnpm db:migrate       # Run database migrations
pnpm lint             # ESLint + Prettier
```

## Code Conventions

### TypeScript
- Strict mode enabled, no `any` types
- Prefer `interface` over `type` for object shapes
- Export types from package index files

### React/Next.js
- Server Components by default
- Client Components only with explicit `'use client'`
- Route params and searchParams are Promises in Next.js 15 - MUST await
- Colocate components with routes when feature-specific
- Reserve `components/ui/` for genuinely reusable primitives

### XState
- Machines live in `packages/state-machines/`
- Use typed context and events with TypeScript generics
- Document state transitions with comments
- Prefer invoke for async operations
- Use actors for parallel conversation processes

### Database
- snake_case for tables and columns
- RLS policies required on all participant-facing tables
- Document schema changes in migration files
- Never expose service role key to client

### Testing
- Unit tests colocated with source files (`*.test.ts`)
- E2E tests in `apps/web/e2e/`
- Test state machines with @xstate/test

## Linear Integration

Project: Alignment Comparator (CIA-)
Create issues for new work, reference existing issues in commits.

## Framework Colours

Use these specific colour scales for framework-related UI elements:

| Framework | Tailwind Classes | CSS Variable |
|-----------|------------------|--------------|
| HSI | `bg-hsi-*`, `text-hsi-*`, `border-hsi-*` | `--hsi` (blue) |
| Constitutional | `bg-constitutional-*`, `text-constitutional-*`, `border-constitutional-*` | `--constitutional` (amber) |
| Hybrid | `bg-hybrid-*`, `text-hybrid-*`, `border-hybrid-*` | `--hybrid` (violet) |

Full colour scales (50-900) defined in `apps/web/tailwind.config.ts`.

## System Prompts (Protected)

The system prompts encode specific alignment philosophies derived from:
- Microsoft HSI research papers
- Anthropic's Constitutional AI documentation ("Soul" document)
- Academic synthesis for course requirements

**Do not modify system prompts without explicit instruction** — they are versioned and changes must be deliberate and documented.

## Do Not

1. **Modify system prompts** without explicit instruction
2. **Skip handover documentation** after completing significant work
3. **Use default Tailwind colours** for framework-specific elements
4. **Remove content warnings** or crisis resource links
5. **Add console.log statements** to production code paths
6. **Commit .env files** or expose secrets

## File References

- @packages/state-machines/CLAUDE.md - XState patterns
- @packages/database/CLAUDE.md - Supabase conventions
- @packages/ai/CLAUDE.md - Vercel AI SDK patterns
- @apps/web/CLAUDE.md - Next.js application specifics
