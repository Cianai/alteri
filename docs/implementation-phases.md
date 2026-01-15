# Implementation Phases

Extracted from Claude Code Setup Guide. Configuration complete (Parts 1-8). These dispatch prompts guide remaining implementation work.

## Current State (as of 2026-01-15)

| Component | Status |
|-----------|--------|
| Monorepo structure | Done |
| Database schema (5 tables with RLS) | Done |
| Claude Code configuration | Done |
| MCP integration | Done |
| Tech stack upgrade (Next.js 15, React 19, ESLint 9) | Done |
| Basic comparison UI | Done (page.tsx) |
| State machines | Skeleton only |
| Route groups | Not started |
| Full elicitation flow | Not started |

---

## Phase 2: State Machines (CIA-23)

```
Think harder about the conversation state machine architecture.

Review the xstate-conversations skill for patterns, then design machines for:

1. consentMachine - Informed consent flow with comprehension checks
2. elicitationMachine - Scenario presentation and response collection
3. comparisonMachine - Framework A/B evaluation flow

PLAN FIRST - create docs/state-machines.md with:
1. State diagrams for each machine (mermaid)
2. Context and event type definitions
3. Actor definitions for async operations
4. Persistence/restoration strategy

Consider:
- How do machines coordinate with each other?
- Where does Supabase persistence happen?
- How does the comparison flow handle anonymous presentation?

Do not write machine code until I approve the design document.
```

### Phase 2.5: Implement State Machines (after design approval)

```
The state machine design in docs/state-machines.md is approved. Implement in packages/state-machines/.

Sequence:
1. Set up package with XState v5 dependencies
2. Create shared types and context interfaces
3. Implement consentMachine first (simplest)
4. Add persistence actors using Supabase client
5. Implement elicitationMachine
6. Implement comparisonMachine
7. Add tests using @xstate/test

Each machine should have:
- Comprehensive TypeScript types
- JSDoc comments on states
- Unit tests for happy path

Commit each machine separately. Reference CIA-23 in commits.
```

---

## Phase 3: AI Integration (CIA-24)

```
Think hard about the Vercel AI SDK integration for framework comparison.

Review the vercel-ai-patterns skill, then design:

1. Provider configuration for Claude and GPT-4o
2. Streaming chat route for elicitation
3. Comparison generation with anonymous presentation
4. System prompts for HSI and Constitutional AI personas

PLAN FIRST - create docs/ai-integration.md with:
1. Provider setup and configuration
2. Route handler designs
3. System prompt strategy (how do we embody each framework?)
4. UIMessage/ModelMessage flow diagram

Key question: How do we make GPT-4o behave according to HSI principles vs Claude with Constitutional AI? The prompts need to embody the frameworks, not just mention them.

Do not write integration code until I approve the design.
```

---

## Phase 4: Core UI Components (CIA-23)

```
Review the existing components in apps/web/components/ and the UI requirements:

Dual persona architecture:
- Participant journey: consent → elicitation → results
- Researcher portal: dashboard → comparison → export

Implement or migrate:
1. ChatUI component with streaming support
2. ProgressIndicator for multi-step flows
3. ComparisonView for side-by-side framework display
4. ConsentFlow with comprehension checks

Use shadcn/ui as the base component library. Follow the conventions in apps/web/CLAUDE.md.

For each component:
- Create in apps/web/components/ui/ or colocate with route
- Add TypeScript props interface
- Include basic Vitest test

Reference CIA-23 in commits.
```

---

## Phase 5: Route Implementation (CIA-24, CIA-25)

```
Implement the Next.js routes connecting state machines to UI.

Participant routes in apps/web/app/(participant)/:
1. /consent - ConsentMachine + ConsentFlow component
2. /elicitation - ElicitationMachine + ChatUI
3. /results - Personal results display (only after completion)

Researcher routes in apps/web/app/(researcher)/:
1. /dashboard - Aggregated results
2. /comparison - Framework comparison tools
3. /export - Data export (GraphML, CSV)

For each route:
- Server Component where possible
- Client Component wrapper for state machine
- Loading and error states
- Route protection where needed (researcher routes)

Reference CIA-24 and CIA-25 in commits.
```

---

## Phase 6: Vercel Deployment (CIA-26)

```
Configure Vercel deployment for the monorepo.

1. Set up environment variables in Vercel dashboard
2. Configure build settings for Turborepo
3. Set up preview deployments for PRs
4. Add deployment hooks for database migrations

Use the Vercel MCP to:
- Check current project configuration
- Verify environment variables are set
- Review deployment logs if issues arise

Test the deployment with a feature branch before merging to main.

Reference CIA-26 in commits.
```

---

## Linear Issue Mapping

| Phase | Linear Issues |
|-------|---------------|
| Phase 2 | CIA-23 (State machines) |
| Phase 3 | CIA-24 (AI integration) |
| Phase 4 | CIA-23 (Components) |
| Phase 5 | CIA-24, CIA-25 (Routes) |
| Phase 6 | CIA-26 (Deployment) |
