# Web Application

Next.js 14+ with App Router serving dual personas (participants and researchers).

## Documentation-First

Before implementing Next.js features, query Context7:
- `context7:resolve-library-id` with "next.js"
- `context7:query-docs` for specific patterns

## CRITICAL: Next.js 15 Async Params

Route params and searchParams are Promises in Next.js 15. Always await:

```typescript
// CORRECT
export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  // use id
}

// WRONG - will fail in Next.js 15
export default function Page({
  params
}: {
  params: { id: string }
}) {
  const { id } = params; // Error!
}
```

## Route Structure

```
app/
├── (participant)/              # Public participant journey
│   ├── page.tsx                # Landing/comparison interface
│   ├── consent/page.tsx        # Informed consent flow
│   ├── elicit/page.tsx         # Scenario elicitation
│   └── results/[id]/page.tsx   # Personal results
├── (researcher)/               # Auth-required researcher portal
│   ├── dashboard/page.tsx      # Overview metrics
│   ├── compare/page.tsx        # Framework comparison tools
│   └── export/page.tsx         # Data export
├── api/
│   ├── compare/route.ts        # Framework comparison endpoint
│   ├── elicit/route.ts         # Elicitation streaming
│   └── auth/[...nextauth]/     # Authentication
├── layout.tsx                  # Root layout with skip link
└── globals.css                 # Global styles, focus indicators
```

## Component Organisation

```
components/
├── ui/                         # Reusable primitives (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── comparison-view.tsx         # Three-column framework comparison
├── content-warning.tsx         # Consent modal with crisis resources
├── framework-response.tsx      # Individual framework response card
├── reasoning-trace.tsx         # Collapsible reasoning section
├── reflection-prompt.tsx       # Buddhist ethics reflection
└── scenario-input.tsx          # Preset/custom scenario input
```

## Framework Colours

Always use framework-specific colours, never default Tailwind:

```tsx
// CORRECT
<div className="bg-hsi-100 border-hsi-500">HSI</div>
<div className="bg-constitutional-100 border-constitutional-500">CAI</div>
<div className="bg-hybrid-100 border-hybrid-500">Hybrid</div>

// WRONG
<div className="bg-blue-100 border-blue-500">HSI</div>
```

## Accessibility Requirements

All components must include:
- Visible focus indicators (`:focus-visible`)
- Keyboard navigation support
- ARIA labels and roles where appropriate
- `prefers-reduced-motion` support for animations
- Screen reader announcements for dynamic content

## API Route Pattern

```typescript
// app/api/compare/route.ts
import { streamText } from 'ai';
import { providers } from '@alteri/ai';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  const { scenario, framework } = await req.json();

  const result = await streamText({
    model: providers.claude,
    system: getSystemPrompt(framework),
    messages: [{ role: 'user', content: scenario }],
  });

  return result.toDataStreamResponse();
}
```

## Environment Variables

Required in `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
