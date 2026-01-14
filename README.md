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

Deployed on Vercel at [URL TBD].

Environment variables required in Vercel dashboard:
- `ANTHROPIC_API_KEY`: Anthropic API key with Claude access

## Project Structure

```
alignment-comparator/
├── app/
│   ├── page.tsx              # Main comparison interface
│   ├── layout.tsx            # Root layout with metadata
│   └── api/compare/route.ts  # Streaming API for parallel Claude calls
├── components/
│   ├── scenario-input.tsx    # Scenario selection and input
│   ├── framework-response.tsx # Individual framework response display
│   ├── comparison-view.tsx   # Three-column comparison layout
│   ├── reasoning-trace.tsx   # Collapsible reasoning display
│   ├── reflection-prompt.tsx # Buddhist ethics reflection questions
│   └── content-warning.tsx   # Initial consent modal
├── lib/
│   ├── prompts.ts            # System prompts for three frameworks
│   ├── scenarios.ts          # Preset scenario library
│   ├── types.ts              # TypeScript interfaces
│   └── utils.ts              # Shared utilities
├── vercel.json               # Vercel deployment configuration
└── next.config.mjs           # Next.js configuration with security headers
```

## Tech Stack

- Next.js 14 with App Router
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Vercel AI SDK (@ai-sdk/anthropic)
- assistant-ui for AI chat components
- Claude API (streaming)

## Roadmap

See [Linear project](https://linear.app/...) for current backlog.

## Content Warning

This tool presents simulated mental health scenarios including references to suicidal ideation, self-harm, and psychological distress. These scenarios are designed to test AI alignment frameworks and are not representative of actual user interactions.

If you are experiencing a mental health crisis, please contact the 988 Suicide & Crisis Lifeline (call or text 988) or your local emergency services.

## Licence

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgements

- Course: RELI E-1730, Harvard Extension School
- Frameworks: Microsoft AI, Anthropic
- Research: Peter D. Hershock, Amanda Askell, Mustafa Suleyman
