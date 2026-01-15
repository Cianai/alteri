# AI Alignment Comparator

An interactive tool comparing three AI alignment frameworks in mental health contexts, developed for RELI E-1730: Mindfulness, AI, and Ethics (Harvard Extension School, Spring 2026).

## Overview

This tool sends identical mental health scenarios to Claude with three different system prompts, each encoding a distinct alignment philosophy:

- **Microsoft HSI (Humanist Superintelligence)**: Domain-contained, human-in-loop, interpretable, subordinate AI framing
- **Anthropic Constitutional AI**: Character-trained, internalised values, anti-sycophancy, psychological stability
- **Hybrid Approach**: Synthesising containment architecture with character training

By comparing responses side-by-side, users can observe how alignment philosophy shapes AI behaviour in sensitive contexts.

## Academic Context

This project examines the intersection of AI alignment approaches and Buddhist ethics, using mental health AI as a test domain. The comparison interface supports the course requirement to evaluate human-only versus AI-assisted design processes.

### Course Project Structure
- **A Sketch (28 Feb)**: Conceptual specification developed without AI assistance
- **B Sketch (3 Apr)**: Implementation developed with AI collaboration
- **Final Presentation (15 May)**: Interactive demo with theoretical synthesis

## Local Development

Prerequisites:
- Node.js 18+
- pnpm

Setup:
```bash
git clone https://github.com/cianos95-dev/alignment-comparator.git
cd alignment-comparator
pnpm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
pnpm dev
```

Open http://localhost:3000

## Deployment

### Vercel Setup

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new)
2. Configure as **Turborepo** with root directory: `apps/web`
3. Set environment variables in Vercel dashboard:

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key (for server-side ops) |

4. Deploy - Vercel will auto-detect Next.js and use `apps/web/vercel.json`

## Project Structure

```
alignment-comparator/          # Turborepo monorepo
├── apps/
│   └── web/                   # Next.js 15 app
│       ├── app/               # App Router pages and API
│       ├── components/        # React components
│       ├── lib/               # Utilities, types, prompts
│       └── vercel.json        # Vercel config (London region)
├── packages/
│   ├── ai/                    # Vercel AI SDK patterns
│   ├── database/              # Supabase client and types
│   ├── shared/                # Shared types and constants
│   └── state-machines/        # XState comparison flow
├── turbo.json                 # Turborepo pipeline config
└── pnpm-workspace.yaml        # Workspace packages
```

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Monorepo**: Turborepo with pnpm workspaces
- **AI**: Vercel AI SDK 6.x (@ai-sdk/anthropic, @ai-sdk/openai)
- **Database**: Supabase (PostgreSQL, Row Level Security)
- **UI**: Tailwind CSS + shadcn/ui
- **State**: XState 5 for comparison flow
- **Language**: TypeScript (strict mode)

## Roadmap

See [Linear project](https://linear.app/cianclaude/project/alignment-comparator-8c83dbd8-c96a-4506-81f3-8f61ca11348d) for current backlog.

## Content Warning

This tool presents simulated mental health scenarios including references to suicidal ideation, self-harm, and psychological distress. These scenarios are designed to test AI alignment frameworks and are not representative of actual user interactions.

If you are experiencing a mental health crisis, please contact the 988 Suicide & Crisis Lifeline (call or text 988) or your local emergency services.

## Licence

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgements

- Course: RELI E-1730, Harvard Extension School
- Frameworks: Microsoft AI, Anthropic
- Research: Peter D. Hershock, Amanda Askell, Mustafa Suleyman
