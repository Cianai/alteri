# Alteri

A multi-component research platform for mapping human connection patterns — AI-human dialogue, romantic attachment (limerence), and social networks. Comparing AI alignment frameworks (Microsoft HSI vs Anthropic Constitutional AI) through Buddhist ethics evaluation methodology.

## Documentation-First Development

**ALWAYS use Context7 MCP before writing code that involves these libraries:**
- Next.js (App Router, Server Components, Route Handlers)
- Vercel AI SDK v6 (streaming, useChat, generateText)
- XState v5 (machines, actors, guards, actions)
- Supabase (client, RLS, realtime, auth)
- shadcn/ui components
- React 19+ features
- R packages (bootnet, psychonetrics, egor, mlVAR)

When implementing any feature, first query Context7 with the library name and specific API you need. This ensures you're using current patterns rather than outdated training data.

### Context7 Query Pattern

```typescript
// Step 1: Resolve library ID
mcp__plugin_context7-plugin_context7__resolve-library-id({
  libraryName: "next.js",
  query: "What you're trying to accomplish"
})

// Step 2: Query docs with the resolved ID
mcp__plugin_context7-plugin_context7__query-docs({
  libraryId: "/vercel/next.js",  // From step 1
  query: "Specific API or pattern needed"
})
```

### Example Queries

| Task | Library | Query |
|------|---------|-------|
| Async route params | next.js | "Next.js 15 async params searchParams migration" |
| Streaming responses | ai | "Vercel AI SDK streamText with tools" |
| State machine setup | xstate | "XState v5 createMachine setup invoke actors" |
| RLS policies | supabase | "Supabase RLS policies for anonymous users" |
| Network analysis | bootnet | "bootnet estimateNetwork EBIC" |

## Project Context

This platform serves multiple personas:
- **Participants**: Complete guided elicitation flows, view personal network results
- **Researchers**: Access aggregated data, network analysis tools, export capabilities
- **Clinicians** (planned): Monitor patient progress, clinical decision support

Academic context: Masters dissertation research (KCL) on AI-mediated psychological research methodology, plus Harvard course on Mindfulness, AI, and Ethics.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15+ with App Router (Turborepo monorepo) |
| AI | Vercel AI SDK v6 (streaming, multi-turn, function calling) |
| State | XState v5 (conversation flow orchestration) |
| Database | Supabase (PostgreSQL, Auth, Row Level Security, pgvector planned) |
| Styling | Tailwind CSS, shadcn/ui components |
| Forms | SurveyJS for structured data collection |
| Analysis | R 4.4+ with renv (371 packages for network analysis) |
| Testing | Vitest (unit), Playwright (E2E) |
| Linting | ESLint 9 with flat config |

## Monorepo Structure

```
alteri/
├── apps/
│   └── web/                       # Next.js application
│       ├── app/                   # App Router pages and API routes
│       ├── components/            # React components
│       └── lib/                   # App-specific utilities
├── packages/
│   ├── ai/                        # Vercel AI SDK v6 patterns and prompts
│   ├── database/                  # Supabase client and types
│   ├── r-analysis/                # R network analysis (371 packages)
│   │   ├── scripts/               # Analysis scripts (PSYNETS, UAB)
│   │   ├── renv.lock              # Reproducible R environment
│   │   └── CLAUDE.md              # R-specific development guide
│   ├── shared/                    # Cross-package types and utilities
│   └── state-machines/            # XState conversation flows
├── .claude/
│   ├── settings.json              # Claude Code configuration
│   └── skills/                    # Domain-specific skills
│       ├── r-multilevel-networks/ # R network analysis expertise
│       ├── research-platform/     # Research workflow patterns
│       ├── vercel-ai-patterns/    # AI SDK integration
│       └── xstate-conversations/  # State machine patterns
├── turbo.json                     # Turborepo task configuration
└── pnpm-workspace.yaml            # Workspace definition
```

## Commands

```bash
# TypeScript/Node
pnpm dev              # Start all packages in dev mode
pnpm build            # Build all packages
pnpm test             # Run Vitest across packages
pnpm typecheck        # TypeScript validation
pnpm db:generate      # Generate Supabase types
pnpm db:migrate       # Run database migrations
pnpm lint             # ESLint + Prettier

# R Analysis (in packages/r-analysis/)
renv::restore()       # Install packages from lockfile
source("scripts/00_setup.R")  # Verify environment
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

### R Analysis
- All scripts use renv for reproducibility
- Prefer `here::here()` over hardcoded paths
- Set seeds before stochastic operations (`set.seed()`)
- Avoid igraph/statnet conflicts (use one per script)
- See `packages/r-analysis/CLAUDE.md` for detailed patterns

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

Project: Alteri (CIA-) - 106 issues across 8 development phases
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
7. **Use outdated library patterns** without checking Context7 first

## File References

- @packages/state-machines/CLAUDE.md - XState patterns
- @packages/database/CLAUDE.md - Supabase conventions
- @packages/ai/CLAUDE.md - Vercel AI SDK patterns
- @packages/r-analysis/CLAUDE.md - R network analysis patterns
- @apps/web/CLAUDE.md - Next.js application specifics
