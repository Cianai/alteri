# AGENTS.md - Alteri Research Platform

## Repository Overview

Multi-component research platform for AI framework comparison and limerence network analysis. Comparing Microsoft HSI vs Anthropic Constitutional AI frameworks through Buddhist ethics evaluation methodology.

## Architecture

```
alteri/
├── apps/
│   └── web/                       # Next.js 15+ App Router application
│       ├── app/                   # Pages and API routes
│       ├── components/            # React components
│       └── lib/                   # App-specific utilities
├── packages/
│   ├── ai/                        # Vercel AI SDK v6 patterns and prompts
│   ├── database/                  # Supabase client and types
│   ├── r-analysis/                # R network analysis (371 packages)
│   ├── shared/                    # Cross-package types and utilities
│   └── state-machines/            # XState v5 conversation flows
└── docs/
    └── specs/                     # Reviewed specifications (adversarial-spec output)
```

## Build Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start development server (all packages) |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript strict checking |
| `pnpm test` | Run Vitest unit tests |
| `pnpm lint` | ESLint with flat config |
| `pnpm e2e` | Playwright E2E tests |

## Agent Instructions

### Before Implementation

1. **Query Context7** for library APIs before writing code involving:
   - Next.js (App Router, Server Components, Route Handlers)
   - Vercel AI SDK v6 (streaming, useChat, generateText)
   - XState v5 (machines, actors, guards, actions)
   - Supabase (client, RLS, realtime, auth)
   - shadcn/ui components
   - React 19+ features

2. **Check existing patterns** in similar components before creating new approaches

3. **Read CLAUDE.md** for domain context and framework-specific guidance

### During Implementation

1. **TypeScript strict mode** - no `any` types, explicit return types on exports
2. **Server Components by default** - use `'use client'` only when necessary
3. **Colocate tests** with source files (*.test.ts alongside *.ts)
4. **Framework colours**:
   - HSI framework: blue palette (`hsi-*` classes)
   - Constitutional AI: amber palette (`constitutional-*` classes)
   - Hybrid: violet palette (`hybrid-*` classes)

### Before Completion

Run verification gate (all must pass):
```bash
pnpm typecheck
pnpm test
pnpm lint
```

## Security Rules

- **Never expose** `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` in client code
- **RLS policies required** on all participant-facing Supabase tables
- **Validate all user inputs** in API routes
- **No console.log** in production code paths
- **No hardcoded credentials** - use environment variables

## Testing Standards

| Test Type | Location | Tool |
|-----------|----------|------|
| Unit tests | Colocated `*.test.ts` | Vitest |
| State machine tests | `packages/state-machines/**/*.test.ts` | @xstate/test |
| E2E tests | `apps/web/e2e/` | Playwright |
| R analysis tests | `packages/r-analysis/tests/` | testthat |

## Spec-Driven Development

Specifications in `docs/specs/` have passed adversarial review and contain:
- Acceptance criteria as testable assertions
- `exec:` label indicating implementation mode
- `env:` label indicating execution environment (optional)
- `linear:` reference to tracking issue

When implementing a spec:
1. Read the full spec before starting
2. Follow the `exec:` mode guidance
3. Reference the Linear issue in commits (`Closes CIA-XXX`)

### Execution Mode Labels

| Label | Environment | Description |
|-------|-------------|-------------|
| `exec:quick` | Desktop | Direct implementation, minimal ceremony |
| `exec:tdd` | Desktop | Test-driven development cycle |
| `exec:pair` | Desktop | Human-in-loop, navigator/driver |
| `exec:checkpoint` | Desktop | Approval gates at milestones |
| `exec:swarm` | Terminal | Multi-agent parallel execution |
| `exec:long-running` | Terminal | Extended runtime (>30 min) |
| `exec:batch` | Terminal | Bulk operations (50+ items) |

### Environment Labels

| Label | Meaning |
|-------|---------|
| `env:desktop` | Suitable for Claude Desktop Code tab (default) |
| `env:terminal` | Must use Terminal with session management |

**Auto-inferred:** `exec:swarm`, `exec:long-running`, and `exec:batch` imply `env:terminal`.

### Spec Frontmatter Example

```yaml
---
linear: CIA-123
exec: tdd
env: desktop  # optional, defaults based on exec mode
status: ready
---
```
