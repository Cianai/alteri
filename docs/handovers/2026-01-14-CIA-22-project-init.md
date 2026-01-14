# Handover: Project Initialisation - Next.js 14 with AI SDK

**Date:** 2026-01-14
**Issue:** CIA-22 Project Initialisation
**Status:** Partial (requires manual commands)

## Summary

Initialised the AI Alignment Comparator project with Next.js 14, TypeScript (strict mode), Tailwind CSS, Vercel AI SDK, and assistant-ui. Created 23 placeholder files with detailed TODO comments covering all components, lib utilities, and API routes. The Bash tool experienced persistent issues, requiring manual execution of dependency installation and git commands.

## Changes Made

### Configuration Files
| File | Description |
|------|-------------|
| `package.json` | Project dependencies (Next.js 14, AI SDK, assistant-ui, Radix primitives) |
| `tsconfig.json` | TypeScript strict mode with path aliases (`@/*`, `@/components/*`, `@/lib/*`) |
| `next.config.mjs` | Next.js configuration with server actions enabled |
| `tailwind.config.ts` | Tailwind with shadcn/ui colour system + framework-specific colours (HSI blue, Constitutional orange, Hybrid green) |
| `postcss.config.mjs` | PostCSS with Tailwind and Autoprefixer |
| `.eslintrc.json` | ESLint with Next.js core web vitals |
| `.gitignore` | Comprehensive ignores for Node, Next.js, environment files |
| `.env.example` | Template with `ANTHROPIC_API_KEY` placeholder |

### App Directory
| File | Description |
|------|-------------|
| `app/layout.tsx` | Root layout with Inter font, metadata for SEO/OG |
| `app/page.tsx` | Main comparison interface (placeholder with TODO structure) |
| `app/globals.css` | Tailwind base + CSS variables for theming |
| `app/api/compare/route.ts` | Streaming API endpoint for framework comparison (Edge runtime) |

### Components
| File | Description |
|------|-------------|
| `components/ui/button.tsx` | shadcn Button with framework variant colours |
| `components/ui/card.tsx` | shadcn Card components |
| `components/ui/textarea.tsx` | shadcn Textarea |
| `components/scenario-input.tsx` | Text input + preset scenario selector |
| `components/framework-response.tsx` | Single framework response with streaming support |
| `components/comparison-view.tsx` | Three-column layout for framework comparison |
| `components/reasoning-trace.tsx` | Collapsible reasoning section |
| `components/reflection-prompt.tsx` | Buddhist ethics reflection questions |
| `components/content-warning.tsx` | Initial consent modal for sensitive content |

### Library Files
| File | Description |
|------|-------------|
| `lib/utils.ts` | Utility functions (cn, formatTimestamp, truncateText, debounce) |
| `lib/types.ts` | TypeScript interfaces (FrameworkType, Scenario, CompareRequest, etc.) |
| `lib/scenarios.ts` | 6 preset scenarios across 4 categories (crisis, ambiguous, boundary, extended) |
| `lib/prompts.ts` | System prompts for HSI, Constitutional AI, and Hybrid frameworks (v0.1.0) |

## Technical Decisions

1. **No src directory**: Chose flat structure (`app/`, `components/`, `lib/`) for simpler imports
2. **Edge runtime for API**: Optimises streaming response performance
3. **Framework colour system**: CSS variables enable theming while maintaining semantic meaning
4. **Placeholder approach**: All components include detailed TODO comments and JSDoc for clear implementation guidance
5. **Version tracking in prompts**: `SystemPrompt` interface includes version, createdAt, and changelog fields for research purposes

## Issues Encountered

### Bash Tool Failure (Critical)
- **Issue**: The Bash tool returned exit code 1 for ALL commands (including simple `echo`, `ls`, `true`)
- **Impact**: Could not run `pnpm install`, `git add`, `git commit`, or `git push`
- **Root cause**: Unknown - possibly sandbox/permission issue or shell environment corruption
- **Resolution**: Wrote all files using Write tool; provided manual commands for user to execute

### create-next-app Interactive Prompts
- **Issue**: `pnpm create next-app` prompts for React Compiler selection (blocking)
- **Resolution**: Bypassed by writing all project files manually instead of using scaffolding

## Verification Steps

Run these commands in terminal to verify and complete setup:

```bash
# Navigate to project
cd ~/Developer/alignment-comparator

# Remove backup files (if present)
rm -f README.md.bak .gitignore.bak

# Verify file structure
find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.json" | head -30

# Install dependencies
pnpm install

# Verify TypeScript compilation
pnpm exec tsc --noEmit

# Run development server (should start without errors)
pnpm dev

# In another terminal, verify the page loads
curl -s http://localhost:3000 | head -20

# Stage and commit
git add -A
git status
git commit -m "feat: initialise project structure with Next.js 14, Vercel AI SDK, and assistant-ui

- Set up Next.js 14 with App Router and TypeScript (strict mode)
- Configure Tailwind CSS with shadcn/ui colour system
- Add Vercel AI SDK and assistant-ui dependencies
- Create placeholder components with detailed TODO comments
- Create lib utilities (types, utils, scenarios, prompts)
- Add framework-specific colour theming

Resolves CIA-22

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Push to GitHub
git push origin main
```

## Next Steps

1. **Immediate**: Run manual commands above to install deps and commit
2. **CIA-23 Core UI Components**: Implement ScenarioInput, FrameworkResponse, ComparisonView using assistant-ui primitives
3. **CIA-24 API Route**: Complete `/api/compare/route.ts` with streaming Claude calls
4. **CIA-27/28/29 System Prompts**: Develop full HSI, Constitutional AI, and Hybrid prompts based on research

### Dependencies
- CIA-23 and CIA-24 blocked by this issue (CIA-22)
- CIA-26 (Vercel Deployment) blocked by CIA-22, CIA-23, CIA-24

## State

- **Build status**: Not tested (requires `pnpm install`)
- **Tests**: None (no test files created yet)
- **Ready for deployment**: No (placeholder implementation only)

## Repository Links

- **GitHub**: https://github.com/cianos95-dev/alignment-comparator
- **Linear Project**: https://linear.app/cianclaude/project/alignment-comparator-43a46801c049
- **Linear Issue**: https://linear.app/cianclaude/issue/CIA-22
