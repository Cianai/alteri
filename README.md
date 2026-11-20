# Alteri

A multi-component research platform for mapping human connection patterns — AI-human dialogue, attachment (AI companionship), and social networks.

## Overview

Alteri combines several research streams into a unified platform:

- **AI Alignment Framework Comparison** — Interactive tool comparing three AI alignment philosophies (Microsoft HSI, Anthropic Constitutional AI, Hybrid) in mental health contexts
- **Limerence & Attachment Research** — Network-based analysis of romantic attachment patterns using multilevel modelling
- **Social Network Analysis** — Ego-network mapping with R-based psychometric analysis (371+ packages)
- **Buddhist Ethics Evaluation** — Contemplative framework integration for therapeutic honesty

## Key Features
- Three-framework AI response comparison with side-by-side display
- Vercel AI SDK v6 streaming with multi-provider support (Anthropic, OpenAI)
- Supabase backend with Row Level Security
- XState v5 conversation flow management
- R-based multilevel network analysis infrastructure (renv-managed)
- SurveyJS demographics collection
- Voice biomarker integration
- Interactive avatar guide via D-ID
- Compliance-first safety architecture (NY/CA regulations)
- Digital phenotyping data model
- NLP-based dynamic assessment

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

## Licence

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgements

- **Courses**: RELI E-1730 (Harvard), KCL MSc, PSYNETS (Amsterdam), UAB (Barcelona)
- **Frameworks**: Microsoft AI (HSI), Anthropic (Constitutional AI)
- **Research**: Peter D. Hershock, Amanda Askell, Mustafa Suleyman
- **Network Analysis**: Sacha Epskamp (bootnet, psychonetrics), Christopher McCarty (egor)
