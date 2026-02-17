# Tembo Agent Instructions — Alteri

This file supplements `AGENTS.md` (which has full repo structure, build commands, and coding standards).

## Branch & Commit Convention

- Branch: `tembo/<task-slug>` (e.g., `tembo/fix-auth-redirect`)
- Commits: Conventional style — `fix:`, `feat:`, `chore:`, `docs:`
- PR body must include `Closes CIA-XXX` referencing the Linear issue

## Verification Gate

Before pushing, run all checks:
```bash
pnpm typecheck && pnpm lint && pnpm test
```

All three must pass. Do not push with failing checks.

## Key Constraints

- **Server Components by default** — only add `'use client'` when state/effects are needed
- **TypeScript strict** — no `any` types
- **Framework colours**: HSI = blue (`hsi-*`), Constitutional AI = amber (`constitutional-*`), Hybrid = violet (`hybrid-*`)
- **No console.log** in production code paths
- **No hardcoded credentials** — use environment variables
- **Colocate tests** with source files (`*.test.ts` alongside `*.ts`)

## Linear Project

All issues belong to **Claudian** team, project **Alteri** or **Ideas & Prototypes**.
