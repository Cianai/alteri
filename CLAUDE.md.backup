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

## Dependency Tracking

Strategic visibility into active, evaluating, and tracked dependencies beyond lock files.

**Manifest:** `alteri-dependencies.json` - JSON inventory of all dependencies by category
**Script:** `scripts/alteri-deps.sh` - CLI for querying and managing dependencies

### Commands

```bash
# View dependencies
./scripts/alteri-deps.sh --list          # All dependencies by category
./scripts/alteri-deps.sh --active        # Production dependencies only
./scripts/alteri-deps.sh --evaluating    # POC/trial dependencies
./scripts/alteri-deps.sh --tracking      # Watching for future adoption

# Inspect specific dependency
./scripts/alteri-deps.sh --check xstate  # Status, version, purpose

# Lifecycle management
./scripts/alteri-deps.sh --promote <name>  # evaluating → active
./scripts/alteri-deps.sh --archive <name>  # evaluating → tracking

# Discovery
./scripts/alteri-deps.sh --sync-linear   # Pull dependency-tagged Linear issues
./scripts/alteri-deps.sh --sync-stars    # Pull relevant GitHub stars

# Research
./scripts/alteri-deps.sh --ecosystem <name>  # HN, GitHub, issues for a dependency
```

### When to Update

- **Adding a new dependency:** Add to manifest with purpose and version
- **Promoting from evaluation:** Run `--promote <name>` when installed to package.json/renv
- **Archiving:** Run `--archive <name>` when evaluation concludes without adoption
- **Periodic sync:** Run `--sync-linear` and `--sync-stars` monthly for discovery
- **Before major upgrades:** Run `--ecosystem <name>` to check community sentiment

### Categories

| Status | Meaning |
|--------|---------|
| Active | Installed and used in production |
| Evaluating | Trialling or POC stage |
| Tracking | Watching for opportunities, not yet integrated |

## Execution Environment

This repo uses the Spec-to-Swarm automated workflow. Specs in `docs/specs/` trigger Claude Code implementation on merge.

### Environment Selection

| Label | Environment | When to Use |
|-------|-------------|-------------|
| `exec:quick` | Desktop | Simple features, quick fixes |
| `exec:tdd` | Desktop | Test-driven work, iterative |
| `exec:pair` | Desktop | Uncertain scope, needs discussion |
| `exec:checkpoint` | Desktop | High-risk, approval gates |
| `exec:swarm` | Terminal | Multi-agent parallel execution |
| `exec:long-running` | Terminal | >30 min expected runtime |
| `exec:batch` | Terminal | 50+ items to process |

**Terminal-only triggers:** Any task estimated >30 minutes or involving bulk operations (Zotero cleanup, mass file processing) should use Terminal with session management.

### Spec Frontmatter

When creating specs for `docs/specs/`:
```yaml
---
linear: CIA-123
exec: swarm
env: terminal  # optional, inferred from exec label
status: ready
---
```

## Linear Integration

Project: Alteri (CIA-*) - 113 issues across 12 modules
Create issues for new work, reference existing issues in commits.

### Decision Tracking (Linear-Native)

Tool and approach decisions are tracked directly in Linear with structured labels and templates.

**Labels:**
| Label | Meaning |
|-------|---------|
| `decision` | Issue contains a tool/approach decision |
| `decision:pending` | Actively evaluating, decision needed |
| `decision:decided` | Decision made, implementing chosen option |
| `decision:revisit` | Decision made but flagged for reassessment |

**CLI Commands:**
```bash
export LINEAR_ACCESS_TOKEN="..."  # Required

./scripts/alteri-deps.sh --decisions          # List all decisions
./scripts/alteri-deps.sh --decision CIA-110   # Show specific decision
./scripts/alteri-deps.sh --decisions-pending  # Decisions needing attention
./scripts/alteri-deps.sh --check-triggers     # Scan for fired reassess triggers
```

**Workflow:**
1. **Creating a decision:** Add `decision` + `decision:pending` labels, use template
2. **Making a decision:** Update description with rationale, change to `decision:decided`
3. **Reassessment needed:** Change to `decision:revisit`, add comment explaining trigger
4. **Monthly review:** Run `--check-triggers` to catch stale decisions

**Issue Description Template for Decisions:**
```markdown
## Decision: [Title]

**Module:** [Module X]
**Status:** pending | decided | revisit

---

## Options

### Option A: [Name]
**Pros:** - Pro 1, Pro 2
**Cons:** - Con 1, Con 2
**Cost:** free | $X/mo | usage-based

---

## Rationale
[Filled when decided]

## Reassess Triggers
- [ ] Trigger 1 (e.g., "Power BI MCP released")
- [ ] Trigger 2 (e.g., "Cost exceeds $50/mo")
```

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

## Verification Gate (MANDATORY)

Before claiming ANY task complete, you MUST run and show evidence of:

```bash
pnpm typecheck    # Must pass
pnpm test         # Must pass
pnpm lint         # Must pass
```

Do not claim "done", "fixed", "complete", or "working" without showing verification output. This is non-negotiable.

Use `superpowers:verification-before-completion` skill for comprehensive verification workflows.

## Do Not

1. **Claim completion without verification** — run typecheck, test, lint first
2. **Modify system prompts** without explicit instruction
3. **Skip handover documentation** after completing significant work
4. **Use default Tailwind colours** for framework-specific elements
5. **Remove content warnings** or crisis resource links
6. **Add console.log statements** to production code paths
7. **Commit .env files** or expose secrets
8. **Use outdated library patterns** without checking Context7 first

## File References

- @packages/state-machines/CLAUDE.md - XState patterns
- @packages/database/CLAUDE.md - Supabase conventions
- @packages/ai/CLAUDE.md - Vercel AI SDK patterns
- @packages/r-analysis/CLAUDE.md - R network analysis patterns
- @apps/web/CLAUDE.md - Next.js application specifics
