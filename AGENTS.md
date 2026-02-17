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

## PR Integration Triad — Actor Roles

The PR lifecycle involves multiple automated actors alongside human reviewers. This section documents who does what. For the plumbing layer (data flows, configuration), see `CONNECTORS.md`.

### Actors in the PR Flow

| Actor | Role | Trigger | What They Do |
|-------|------|---------|--------------|
| **Claude Code** | Author | Manual (human starts session) | Writes code, creates branch, opens PR with `Closes CIA-XXX`, addresses review feedback |
| **GitHub Copilot** | Automated Reviewer | PR opened/updated (automatic) | Structural review: security, bugs, dead code, style. Posts overview + inline comments |
| **Vercel Bot** | Automated Deployer | PR opened/push (automatic) | Deploys preview, posts URL as PR comment, runs deployment checks |
| **Linear Bot** | Issue Tracker | PR branch name or body match | Links PR to issue, auto-closes issue on merge |
| **Cian** | Human Reviewer | PR ready for review | Final approval gate. Reviews code + Copilot findings + Vercel preview |
| **Cursor** | Secondary Reviewer | Manual (Cian opens PR in Cursor) | On-demand code review with project context. Not automated — Cian drives |

### Current Workflow (as practiced)

```
1. Claude Code creates branch (claude/cia-XXX-description)
2. Claude Code implements, commits, pushes
3. Claude Code opens PR with "Closes CIA-XXX" in body
   ├── Copilot auto-reviews (1-3 min) → inline comments + overview
   ├── Vercel auto-deploys preview (2-5 min) → preview URL comment
   └── Linear auto-links PR to CIA-XXX
4. Cian reviews:
   a. Reads Copilot findings first (triage: fix-now / fix-forward / dismiss)
   b. Clicks Vercel preview URL for visual verification
   c. Optionally opens in Cursor for deeper review
   d. Approves or requests changes
5. If changes requested:
   a. Claude Code addresses feedback (same branch)
   b. Copilot re-reviews updated files
   c. Vercel re-deploys preview
   d. Cian re-reviews
6. Cian merges PR
   ├── Vercel deploys to production
   ├── Linear auto-closes CIA-XXX (if Closes tag present)
   └── Claude Code posts closing comment (per Stage 7.5 rules)
```

### What's Manual vs Automated

| Step | Status | Notes |
|------|--------|-------|
| Branch creation | **Automated** (Claude Code) | Branch naming convention: `claude/cia-XXX-*` |
| PR creation | **Automated** (Claude Code) | Includes `Closes CIA-XXX` in body |
| Code review (Copilot) | **Automated** | Triggers on every PR, no setup per-PR |
| Preview deploy (Vercel) | **Automated** | Triggers on every push to PR branch |
| Issue linking (Linear) | **Automated** | Via branch name or PR body |
| Human review | **Manual** | Cian reviews PR, Copilot findings, preview |
| Cursor review | **Manual** | Cian optionally opens PR in Cursor |
| Feedback addressing | **Manual trigger** (Claude Code session) | Claude addresses review comments |
| Merge | **Manual** | Cian clicks merge |
| Issue closure | **Automated** (Linear) | On merge, if `Closes CIA-XXX` present |
| Closing comment | **Automated** (Claude Code) | Per Stage 7.5 rules |

### Copilot Finding Triage Rules

When Copilot posts review findings, triage each into one of three categories:

| Category | Action | When |
|----------|--------|------|
| **Fix-now** | Address before merge | Security issues, bugs, broken functionality |
| **Fix-forward** | Create sub-issue in Linear | Style improvements, refactoring opportunities, non-blocking |
| **Dismiss** | Comment with rationale | False positives, intentional patterns, out of scope |

**Rule:** Never merge with unaddressed fix-now items. Fix-forward items get `type:chore` sub-issues linked to the parent.

### Automation Opportunities (Not Yet Implemented)

| Opportunity | Tool | Effort | Value |
|-------------|------|--------|-------|
| `.github/instructions/review.instructions.md` | Copilot | Low | Custom review context reduces false positives |
| BugBot auto-review | Cursor ($40/mo) | Medium | Second AI reviewer, multi-model diversity |
| n8n PR aggregation workflow | n8n | Medium | Consolidate bot outputs into single Linear comment |
| `@copilot` as issue assignee | GitHub Copilot agent | Low | Copilot implements fix-forward items autonomously |

---

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
