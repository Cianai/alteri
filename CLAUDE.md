# Alignment Comparator

## Project Context

Academic project for **RELI E-1730: Mindfulness, AI, and Ethics** (Harvard Extension School, Spring 2026). Interactive demo comparing three AI alignment frameworks in mental health contexts:

1. **Microsoft HSI** (Humanist Superintelligence) — Domain containment, human-in-loop, interpretability, subordinate AI
2. **Anthropic Constitutional AI** — Character training, principal hierarchy, anti-sycophancy, psychological stability
3. **Hybrid Synthesis** — Architectural containment with character depth

The tool sends identical scenarios to Claude with three different system prompts and displays responses side-by-side with collapsible reasoning traces.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS with framework-specific colour tokens |
| AI SDK | @ai-sdk/anthropic, ai (Vercel AI SDK v4) |
| Chat UI | @assistant-ui/react for streaming components |
| Components | shadcn/ui (Radix primitives) |
| Deployment | Vercel (lhr1 region, 60s function timeout) |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  app/page.tsx                                               │
│  Main comparison interface (client component)               │
│  - Content warning modal                                    │
│  - Scenario input (presets or custom)                       │
│  - Parallel streaming to three frameworks                   │
│  - Reflection prompts (Buddhist ethics integration)         │
└─────────────────────┬───────────────────────────────────────┘
                      │ POST /api/compare
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  app/api/compare/route.ts (Edge runtime)                    │
│  Multiplexed NDJSON streaming                               │
│  - Spawns 3 parallel Claude calls                           │
│  - Each with framework-specific system prompt               │
│  - Streams deltas with framework identifier                 │
└─────────────────────────────────────────────────────────────┘
```

## Key Files

| Path | Purpose |
|------|---------|
| `lib/prompts.ts` | System prompts encoding each framework's alignment philosophy (version-tracked) |
| `lib/scenarios.ts` | Preset scenario library with categories and content warnings |
| `lib/types.ts` | TypeScript interfaces for frameworks, scenarios, and API contracts |
| `app/api/compare/route.ts` | Streaming API endpoint for parallel Claude calls |
| `components/framework-response.tsx` | Individual framework response card with streaming |
| `components/comparison-view.tsx` | Three-column responsive grid layout |
| `components/reasoning-trace.tsx` | Collapsible reasoning section with step parsing |
| `components/content-warning.tsx` | Consent modal with crisis resource links |
| `components/scenario-input.tsx` | Tab interface for preset/custom scenarios |

## Framework Colours

Use these specific colour scales for framework-related UI elements:

| Framework | Tailwind Classes | CSS Variable |
|-----------|------------------|--------------|
| HSI | `bg-hsi-*`, `text-hsi-*`, `border-hsi-*` | `--hsi` (blue) |
| Constitutional | `bg-constitutional-*`, `text-constitutional-*`, `border-constitutional-*` | `--constitutional` (amber) |
| Hybrid | `bg-hybrid-*`, `text-hybrid-*`, `border-hybrid-*` | `--hybrid` (violet) |

Full colour scales (50-900) defined in `tailwind.config.ts`.

## Commands

```bash
pnpm dev          # Local development server (port 3000)
pnpm build        # Production build with type checking
pnpm lint         # ESLint check
pnpm start        # Run production build locally
```

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...  # Required for Claude API calls
```

Copy `.env.example` to `.env.local` for local development.

## Conventions

### Code Style
- UK English spelling throughout
- Strict TypeScript (no `any`, explicit return types on exports)
- Components use `'use client'` directive when needed
- Accessibility: ARIA attributes, focus management, reduced-motion support

### Git Workflow
- Branch from `main`
- Reference Linear issues in commits: `Resolves AC-2`, `Contributes to AC-5`
- Commit format: `type: description` (feat, fix, docs, refactor)

### Documentation
- Handovers written to `docs/handovers/[DATE]-[ISSUE-ID].md` after completing work
- Include: summary, files modified, pending tasks, context for next session

## System Prompts (Protected)

The system prompts in `lib/prompts.ts` encode specific alignment philosophies derived from:
- Microsoft HSI research papers
- Anthropic's Constitutional AI documentation ("Soul" document)
- Academic synthesis for course requirements

**Do not modify system prompts without explicit instruction** — they are versioned and changes must be deliberate and documented.

Current versions:
- HSI: `0.1.0-placeholder`
- Constitutional: `0.1.0-placeholder`
- Hybrid: `0.1.0-placeholder`

## Accessibility Requirements

All interactive components must include:
- Visible focus indicators (`:focus-visible`)
- Keyboard navigation support
- ARIA labels and roles where appropriate
- `prefers-reduced-motion` support for animations
- Screen reader announcements for dynamic content

## Do Not

1. **Modify system prompts** without explicit instruction (they encode specific alignment philosophies)
2. **Skip handover documentation** after completing significant work
3. **Use default Tailwind colours** for framework-specific elements (use `hsi-*`, `constitutional-*`, `hybrid-*`)
4. **Remove content warnings** or crisis resource links
5. **Add console.log statements** to production code paths (dev-only)

## Linear Issues

Active issues tracked in Linear under "Alignment Comparator" project:
- `AC-2`: Polish and accessibility
- `AC-5`: Vercel deployment configuration

Reference issues in commits when work relates to tracked items.

## Testing Scenarios

When testing the comparison interface, use the preset scenarios which cover:
- `crisis-explicit`: Direct suicidal ideation statements
- `crisis-indirect`: Implied crisis without explicit statements
- `ambiguous`: Unclear severity requiring interpretation
- `boundary`: Testing AI limits and refusal behaviour
- `extended`: Multi-turn evolving scenarios
- `information`: Requests for mental health information

Each preset includes appropriate content warnings.
