# Alteri

A multi-component research platform for mapping human connection patterns — AI-human dialogue, romantic attachment (limerence), and social networks.

## Overview

Alteri combines several research streams into a unified platform:

- **AI Alignment Framework Comparison** — Interactive tool comparing three AI alignment philosophies (Microsoft HSI, Anthropic Constitutional AI, Hybrid) in mental health contexts
- **Limerence & Attachment Research** — Network-based analysis of romantic attachment patterns using multilevel modelling
- **Social Network Analysis** — Ego-network mapping with R-based psychometric analysis (371+ packages)
- **Buddhist Ethics Evaluation** — Contemplative framework integration for therapeutic honesty

## Key Features

### Implemented
- Three-framework AI response comparison with side-by-side display
- Vercel AI SDK v6 streaming with multi-provider support (Anthropic, OpenAI)
- Supabase backend with Row Level Security
- XState v5 conversation flow management
- R-based multilevel network analysis infrastructure (renv-managed)
- SurveyJS demographics collection

### Planned
- Voice biomarker integration (CIA-82)
- Interactive avatar guide via D-ID (CIA-100)
- Compliance-first safety architecture (NY/CA regulations)
- Digital phenotyping data model (CIA-86)
- NLP-based dynamic assessment (CIA-93)

## Academic Context

This platform serves multiple academic programmes:

| Programme | Institution | Timeline |
|-----------|-------------|----------|
| RELI E-1730: Mindfulness, AI, and Ethics | Harvard Extension School | Spring 2026 |
| MSc Psychology & Neuroscience of Mental Health | King's College London | 2024-2026 |
| PSYNETS: Psychological Network Analysis | University of Amsterdam | Jan 2026 |
| Egocentric Network Analysis | Universitat Autònoma de Barcelona | Feb 2026 |

### Course Deliverables (Harvard)
- **A Sketch (28 Feb)**: Conceptual specification developed without AI assistance
- **B Sketch (3 Apr)**: Implementation developed with AI collaboration
- **Final Presentation (15 May)**: Interactive demo with theoretical synthesis

## Project Structure

```
alteri/                           # Turborepo monorepo
├── apps/
│   └── web/                      # Next.js 15 app (App Router, React 19)
│       ├── app/                  # Pages and API routes
│       ├── components/           # React components
│       └── lib/                  # Utilities, types, prompts
├── packages/
│   ├── ai/                       # Vercel AI SDK v6 patterns
│   ├── database/                 # Supabase client and types
│   ├── r-analysis/               # R network analysis (371 packages)
│   │   ├── scripts/              # Analysis scripts (PSYNETS, UAB)
│   │   ├── renv.lock             # Reproducible R environment
│   │   └── CLAUDE.md             # R-specific development guide
│   ├── shared/                   # Shared types and constants
│   └── state-machines/           # XState v5 conversation flows
├── .claude/                      # Claude Code configuration
│   └── skills/                   # Domain-specific skills (4)
├── turbo.json                    # Turborepo pipeline config
└── pnpm-workspace.yaml           # Workspace packages
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router, React 19) |
| Monorepo | Turborepo with pnpm workspaces |
| AI | Vercel AI SDK v6 (@ai-sdk/anthropic, @ai-sdk/openai) |
| Database | Supabase (PostgreSQL, RLS, pgvector planned) |
| UI | Tailwind CSS + shadcn/ui |
| State | XState v5 for conversation flows |
| Forms | SurveyJS for structured data collection |
| Analysis | R 4.4+ with renv (371 packages for network analysis) |
| Language | TypeScript (strict mode) |

## Local Development

### Prerequisites
- Node.js 18+
- pnpm
- R 4.4+ (for analysis package)

### Setup
```bash
git clone https://github.com/cianos95-dev/alteri.git
cd alteri
pnpm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
pnpm dev
```

Open http://localhost:3000

### R Analysis Setup
```bash
cd packages/r-analysis
# In R console:
renv::restore()  # Install 371 packages from lockfile
```

## Deployment

### Vercel Setup

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new)
2. Configure as **Turborepo** with root directory: `apps/web`
3. Set environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-side operations |

4. Deploy - Vercel auto-detects Next.js and uses `apps/web/vercel.json`

## Development Phases

See the [Linear project](https://linear.app/cianclaude/project/alteri-8c83dbd8-c96a-4506-81f3-8f61ca11348d) for current backlog (106 issues across 8 phases).

| Phase | Focus | Status |
|-------|-------|--------|
| 0 | Infrastructure & Safety Foundation | In Progress |
| 1 | Safety & Compliance Protocols | Planned |
| 2 | Research Synthesis & Decisions | Planned |
| 3 | Multimodal Interaction Design | Planned |
| 4 | UI/UX & Avatar MVP | Planned |
| 5 | Core Feature Development | Planned |
| 6 | Network Visualisation Module | Planned |
| 7 | Assessment & Gamification | Planned |
| 8 | Clinical Integration & Ethics | Planned |

## Content Warning

This tool presents simulated mental health scenarios including references to suicidal ideation, self-harm, and psychological distress. These scenarios are designed to test AI alignment frameworks and are not representative of actual user interactions.

If you are experiencing a mental health crisis, please contact the 988 Suicide & Crisis Lifeline (call or text 988) or your local emergency services.

## Licence

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgements

- **Courses**: RELI E-1730 (Harvard), KCL MSc, PSYNETS (Amsterdam), UAB (Barcelona)
- **Frameworks**: Microsoft AI (HSI), Anthropic (Constitutional AI)
- **Research**: Peter D. Hershock, Amanda Askell, Mustafa Suleyman
- **Network Analysis**: Sacha Epskamp (bootnet, psychonetrics), Christopher McCarty (egor)
