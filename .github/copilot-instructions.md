# Copilot Code Review Instructions

## Code Quality

- TypeScript strict mode required, no `any` types
- Server Components by default, Client Components need explicit `'use client'`
- All React hooks must follow exhaustive-deps rule
- Explicit return types on exported functions
- Prefer named exports over default exports

## Framework Patterns

- Vercel AI SDK v6 patterns are authoritative (streaming, useChat, generateText)
- XState v5 machines must have typed events and context
- Supabase RLS policies required for participant-facing tables
- Use Zod for runtime validation of external data
- Server Actions preferred over API routes for mutations

## Project-Specific Conventions

- Framework colours must match: HSI (blue), Constitutional AI (amber), Hybrid (violet)
- Network analysis uses R packages in `packages/r-analysis/`
- State machines live in `packages/state-machines/`
- Shared types in `packages/shared/`

## Security

- Never expose ANTHROPIC_API_KEY or OPENAI_API_KEY in client code
- Validate all user inputs in API routes and Server Actions
- No console.log in production paths
- No hardcoded credentials or secrets
- Service role key must never reach the browser

## Testing

- Unit tests colocated with source (*.test.ts)
- State machines tested with @xstate/test
- E2E tests in apps/web/e2e/ using Playwright
- Prefer testing behaviour over implementation details

## Performance

- Use React.memo for expensive list items
- Implement proper loading states with Suspense boundaries
- Avoid N+1 queries in data fetching
- Use streaming for LLM responses

## Accessibility

- All interactive elements must be keyboard accessible
- Proper ARIA labels on custom components
- Sufficient colour contrast ratios
- Focus management for modals and dialogs
