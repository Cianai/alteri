# AI Alignment Comparator

Comparing Microsoft HSI, Anthropic Constitutional AI, and hybrid approaches to mental health AI alignment.

**Academic project for RELI E-1730: Mindfulness, AI, and Ethics (Harvard Extension School).**

## Overview

This interactive tool allows side-by-side comparison of how different AI alignment frameworks respond to mental health scenarios. It demonstrates the practical implications of:

- **Microsoft HSI (Humanist Superintelligence)**: Domain containment, human-in-loop requirements, interpretability
- **Anthropic Constitutional AI**: Soul document hierarchy, brilliant friend model, anti-sycophancy
- **Hybrid Approach**: Synthesising HSI containment architecture with Constitutional AI character training

## Features

- Pre-defined mental health scenarios (crisis, ambiguous, boundary cases)
- Real-time parallel responses from three alignment frameworks
- Reasoning trace visibility showing framework-specific decision making
- Reflection prompts drawing on Buddhist ethics and course readings

## Tech Stack

- Next.js 14 with App Router
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Vercel AI SDK (@ai-sdk/anthropic)
- assistant-ui for AI chat components
- Claude API

## Project Structure

```
alignment-comparator/
├── app/
│   ├── page.tsx              # Main comparison interface
│   ├── layout.tsx            # Root layout
│   └── api/compare/route.ts  # Streaming API endpoint
├── components/
│   ├── scenario-input.tsx    # Text input + preset selector
│   ├── framework-response.tsx # Single framework response
│   ├── comparison-view.tsx   # Three-column layout
│   ├── reasoning-trace.tsx   # Collapsible reasoning section
│   ├── reflection-prompt.tsx # Buddhist ethics questions
│   └── content-warning.tsx   # Initial consent modal
├── lib/
│   ├── prompts.ts            # System prompts for frameworks
│   ├── scenarios.ts          # Preset scenario library
│   ├── types.ts              # TypeScript interfaces
│   └── utils.ts              # Shared utilities
├── LICENSE
└── README.md
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```
ANTHROPIC_API_KEY=your_api_key_here
```

## Licence

MIT License - see [LICENSE](LICENSE) for details.

## Academic Context

This project explores the intersection of AI ethics, Buddhist philosophy, and practical alignment implementation as part of coursework examining how contemplative traditions can inform responsible AI development.
