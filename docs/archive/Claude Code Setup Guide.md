# Claude Code Setup Guide: Conversational Research Platform

This document contains everything needed to configure Claude Code for implementing the AI alignment comparison research platform. Work through each section in order. The dispatch prompts at the end map to your Linear issues.

---

## Part 1: Monorepo Migration Structure

The current flat structure migrates to a Turborepo monorepo with clear separation between the web application, shared packages, and configuration.

### Target Structure

```
alignment-comparator/
├── apps/
│   └── web/                          # Next.js application
│       ├── app/
│       │   ├── (participant)/        # Participant journey routes
│       │   │   ├── consent/
│       │   │   ├── elicitation/
│       │   │   └── results/
│       │   ├── (researcher)/         # Researcher portal routes
│       │   │   ├── dashboard/
│       │   │   ├── comparison/
│       │   │   └── export/
│       │   ├── api/
│       │   ├── layout.tsx
│       │   └── page.tsx              # Landing with dual entry points
│       ├── components/
│       │   └── ui/                   # Shared UI components
│       ├── lib/
│       ├── CLAUDE.md                 # Web-specific instructions
│       ├── next.config.mjs
│       ├── tailwind.config.ts
│       └── package.json
├── packages/
│   ├── state-machines/               # XState conversation flows
│   │   ├── src/
│   │   │   ├── elicitation/          # Participant elicitation machines
│   │   │   ├── comparison/           # Framework comparison machines
│   │   │   └── index.ts
│   │   ├── CLAUDE.md
│   │   └── package.json
│   ├── database/                     # Supabase client and types
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── types.ts              # Generated from Supabase
│   │   │   └── queries/
│   │   ├── CLAUDE.md
│   │   └── package.json
│   ├── ai/                           # Vercel AI SDK patterns
│   │   ├── src/
│   │   │   ├── providers/            # Claude, GPT configurations
│   │   │   ├── prompts/
│   │   │   └── streaming/
│   │   ├── CLAUDE.md
│   │   └── package.json
│   └── shared/                       # Types, utils, constants
│       ├── src/
│       └── package.json
├── docs/                             # Research documentation
│   └── handovers/
├── .claude/
│   ├── settings.json
│   ├── settings.local.json           # Gitignored
│   └── skills/
│       ├── xstate-conversations/
│       │   └── SKILL.md
│       ├── research-platform/
│       │   └── SKILL.md
│       └── vercel-ai-patterns/
│           └── SKILL.md
├── CLAUDE.md                         # Root instructions
├── .mcp.json                         # MCP server configuration
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Part 2: Root CLAUDE.md

Create this file at the repository root. It establishes project context and conventions that apply everywhere.

```markdown
# Alignment Comparator

A conversational research platform comparing AI alignment frameworks (Microsoft HSI vs Anthropic Constitutional AI) through Buddhist ethics evaluation methodology.

## Project Context

This platform serves two personas:
- **Participants**: Complete guided elicitation flows, view personal results
- **Researchers**: Access aggregated data, framework comparison tools, export capabilities

Academic context: Masters dissertation research on AI-mediated psychological research methodology.

## Tech Stack

- **Framework**: Next.js 14+ with App Router (Turborepo monorepo)
- **AI**: Vercel AI SDK 5.0 (streaming, multi-turn, function calling)
- **State**: XState v5 (conversation flow orchestration)
- **Database**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Styling**: Tailwind CSS, shadcn/ui components
- **Testing**: Vitest (unit), Playwright (E2E)

## Monorepo Structure

- `apps/web/` - Next.js application
- `packages/state-machines/` - XState conversation flows
- `packages/database/` - Supabase client and types
- `packages/ai/` - Vercel AI SDK patterns and prompts
- `packages/shared/` - Cross-package types and utilities

## Commands

```bash
pnpm dev              # Start all packages in dev mode
pnpm build            # Build all packages
pnpm test             # Run Vitest across packages
pnpm typecheck        # TypeScript validation
pnpm db:generate      # Generate Supabase types
pnpm db:migrate       # Run database migrations
pnpm lint             # ESLint + Prettier
```

## Code Conventions

### TypeScript
- Strict mode enabled, no `any` types
- Prefer `interface` over `type` for object shapes
- Export types from package index files

### React/Next.js
- Server Components by default
- Client Components only with explicit `'use client'`
- Route params and searchParams are Promises in Next.js 15 - MUST await
- Colocate components with routes when feature-specific
- Reserve `components/ui/` for genuinely reusable primitives

### XState
- Machines live in `packages/state-machines/`
- Use typed context and events with TypeScript generics
- Document state transitions with comments
- Prefer invoke for async operations
- Use actors for parallel conversation processes

### Database
- snake_case for tables and columns
- RLS policies required on all participant-facing tables
- Document schema changes in migration files
- Never expose service role key to client

### Testing
- Unit tests colocated with source files (`*.test.ts`)
- E2E tests in `apps/web/e2e/`
- Test state machines with @xstate/test

## Linear Integration

Project: Alignment Comparator (CIA-)
Create issues for new work, reference existing issues in commits.

## File References

@packages/state-machines/CLAUDE.md - XState patterns
@packages/database/CLAUDE.md - Supabase conventions
@packages/ai/CLAUDE.md - Vercel AI SDK patterns
@apps/web/CLAUDE.md - Next.js application specifics
```

---

## Part 3: Package-Specific CLAUDE.md Files

### packages/state-machines/CLAUDE.md

```markdown
# State Machines Package

XState v5 conversation flow orchestration for the research platform.

## Architecture

Conversation flows are modelled as hierarchical state machines:
- Parent machines manage session lifecycle
- Child machines handle specific elicitation phases
- Actors enable parallel processes (e.g., response streaming + progress tracking)

## Machine Categories

### Elicitation Machines
Located in `src/elicitation/`
- `consentMachine` - Informed consent flow with comprehension checks
- `demographicsMachine` - Participant background collection
- `scenarioMachine` - Mental health scenario presentation and response
- `reflectionMachine` - Buddhist ethics reflection prompts

### Comparison Machines
Located in `src/comparison/`
- `frameworkComparisonMachine` - Side-by-side HSI vs Constitutional AI
- `evaluationMachine` - Rubric-based assessment flow

## Conventions

### Machine Definition Pattern
```typescript
import { setup, assign } from 'xstate';

export const exampleMachine = setup({
  types: {
    context: {} as ExampleContext,
    events: {} as ExampleEvents,
  },
  guards: {
    // Named guard functions
  },
  actions: {
    // Named action functions
  },
}).createMachine({
  id: 'example',
  initial: 'idle',
  context: {
    // Initial context
  },
  states: {
    // State definitions
  },
});
```

### Actor Communication
- Use `sendTo` for direct actor messaging
- Use `emit` for event broadcasting
- Parent-child communication via `sendParent`

### Persistence
- Machines snapshot to Supabase on significant transitions
- Use `@xstate/persistence` adapter pattern
- Restore from snapshot on session resume

## Testing

Use @xstate/test for model-based testing:
```typescript
import { createTestModel } from '@xstate/test';

const model = createTestModel(machine);
const paths = model.getShortestPaths();
```
```

### packages/database/CLAUDE.md

```markdown
# Database Package

Supabase client, types, and query patterns for research data persistence.

## Schema Principles

### Participant Data Isolation
All participant-facing tables MUST have RLS policies:
```sql
CREATE POLICY "Users can only access own data"
ON participant_responses
FOR ALL
USING (auth.uid() = participant_id);
```

### GDPR Article 89 Compliance
- Pseudonymisation at collection (random participant IDs)
- Linking keys stored separately with restricted access
- Withdrawal handlers that preserve anonymised research data

## Table Naming

- snake_case for all identifiers
- Prefix participant tables: `participant_*`
- Prefix research tables: `research_*`
- Prefix system tables: `system_*`

## Type Generation

Types auto-generated from schema:
```bash
pnpm db:generate
```

Generated types live in `src/types.ts` - never edit manually.

## Query Patterns

### Server-Side (Route Handlers)
```typescript
import { createClient } from '@/database';

const supabase = createClient();
const { data, error } = await supabase
  .from('participant_responses')
  .select('*')
  .eq('session_id', sessionId);
```

### Client-Side (with RLS)
```typescript
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## Migrations

Migration files in `supabase/migrations/`:
- Timestamp prefix: `20260115000000_description.sql`
- Include rollback comments
- Document RLS policy reasoning
```

### packages/ai/CLAUDE.md

```markdown
# AI Package

Vercel AI SDK 5.0 patterns for multi-model comparison and streaming.

## Provider Configuration

### Claude (Constitutional AI)
```typescript
import { anthropic } from '@ai-sdk/anthropic';

export const claudeProvider = anthropic('claude-sonnet-4-20250514');
```

### OpenAI (for comparison baseline)
```typescript
import { openai } from '@ai-sdk/openai';

export const gptProvider = openai('gpt-4o');
```

## Streaming Patterns

### UIMessage vs ModelMessage
- `UIMessage`: Display state (shown to user)
- `ModelMessage`: Persistence state (stored in database)

Always maintain separation:
```typescript
const { messages, append } = useChat({
  id: sessionId,
  onFinish: (message) => {
    // Persist ModelMessage to Supabase
    persistMessage(toModelMessage(message));
  },
});
```

### Multi-Turn Control
Use `stopWhen` and `prepareStep` for conversation orchestration:
```typescript
const result = await generateText({
  model: provider,
  messages,
  stopWhen: (response) => response.includes('[END_TURN]'),
  prepareStep: async (step) => {
    // Inject context between turns
  },
});
```

## Framework Comparison Pattern

For side-by-side HSI vs Constitutional AI comparison:
```typescript
const [hsiResponse, caiResponse] = await Promise.all([
  generateWithHSI(scenario),
  generateWithCAI(scenario),
]);
```

Present anonymously to prevent brand bias (reveal after evaluation).

## Prompt Management

Prompts versioned in `src/prompts/`:
- Semantic versioning for scenarios
- Include evaluation rubric in system prompts
- Document prompt changes in git history
```

### apps/web/CLAUDE.md

```markdown
# Web Application

Next.js 14+ application with App Router serving dual personas.

## Route Structure

### Route Groups
- `(participant)/` - Participant journey (public, auth optional)
- `(researcher)/` - Researcher portal (auth required)

### Key Routes
- `/` - Landing with persona selection
- `/consent` - Informed consent flow
- `/elicitation` - Guided scenario responses
- `/results` - Personal results visualisation
- `/dashboard` - Researcher aggregated view
- `/comparison` - Framework comparison tools

## Component Patterns

### Server vs Client
```typescript
// Default: Server Component
export default async function Page() {
  const data = await fetchData();
  return <Display data={data} />;
}

// Only when needed: Client Component
'use client';
export function InteractiveWidget() {
  const [state, setState] = useState();
  // ...
}
```

### State Machine Integration
```typescript
'use client';
import { useMachine } from '@xstate/react';
import { elicitationMachine } from '@alignment-comparator/state-machines';

export function ElicitationFlow() {
  const [state, send] = useMachine(elicitationMachine);
  // ...
}
```

## API Routes

Located in `app/api/`:
- `chat/route.ts` - Streaming chat endpoint
- `comparison/route.ts` - Framework comparison endpoint
- `export/route.ts` - Research data export

Use Vercel AI SDK route handlers:
```typescript
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = await streamText({ model, messages });
  return result.toDataStreamResponse();
}
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```
```

---

## Part 4: .claude/settings.json

Create `.claude/` directory and this settings file:

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm:*)",
      "Bash(turbo:*)",
      "Bash(npx:*)",
      "Bash(git:*)",
      "Bash(supabase:*)",
      "Bash(vercel:*)",
      "Read",
      "Write",
      "Edit"
    ],
    "deny": [
      "Read(.env*)",
      "Read(**/secrets/**)",
      "Read(**/*.pem)",
      "Read(**/*.key)",
      "Bash(curl:*)",
      "Bash(wget:*)",
      "Bash(rm -rf /)*"
    ]
  },
  "enableAllProjectMcpServers": true,
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "[ \"$(git branch --show-current)\" != \"main\" ] || echo 'Warning: On main branch'"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \"$TOOL_INPUT\" == *.ts ]] || [[ \"$TOOL_INPUT\" == *.tsx ]]; then pnpm typecheck --filter=$(dirname $TOOL_INPUT) 2>/dev/null || true; fi"
          }
        ]
      }
    ]
  }
}
```

Also create `.claude/settings.local.json` (add to .gitignore):

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}",
    "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}",
    "GITHUB_TOKEN": "${GITHUB_TOKEN}"
  }
}
```

---

## Part 5: Custom Skills

### .claude/skills/xstate-conversations/SKILL.md

```markdown
---
name: xstate-conversations
description: XState v5 patterns for conversation flow state machines. Invoke when implementing state machines, actors, elicitation flows, or multi-step UI processes.
allowed-tools: Read, Write, Edit, Bash
---

# XState v5 Conversation Patterns

## When to Use This Skill
- Creating new conversation flow machines
- Implementing actor-based parallel processes
- Adding persistence/restoration to state machines
- Testing state machine paths

## Machine Structure Template

```typescript
import { setup, assign, fromPromise } from 'xstate';

interface ConversationContext {
  sessionId: string;
  participantId: string;
  messages: Message[];
  currentStep: number;
  error?: string;
}

type ConversationEvent =
  | { type: 'START' }
  | { type: 'RESPOND'; content: string }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'ERROR'; message: string };

export const conversationMachine = setup({
  types: {
    context: {} as ConversationContext,
    events: {} as ConversationEvent,
  },
  actors: {
    streamResponse: fromPromise(async ({ input }) => {
      // Vercel AI SDK streaming
    }),
    persistState: fromPromise(async ({ input }) => {
      // Supabase persistence
    }),
  },
  guards: {
    hasMoreSteps: ({ context }) => context.currentStep < TOTAL_STEPS,
    canGoBack: ({ context }) => context.currentStep > 0,
  },
  actions: {
    incrementStep: assign({ currentStep: ({ context }) => context.currentStep + 1 }),
    decrementStep: assign({ currentStep: ({ context }) => context.currentStep - 1 }),
    addMessage: assign({
      messages: ({ context, event }) => 
        event.type === 'RESPOND' 
          ? [...context.messages, { role: 'user', content: event.content }]
          : context.messages,
    }),
  },
}).createMachine({
  id: 'conversation',
  initial: 'idle',
  context: ({ input }) => ({
    sessionId: input.sessionId,
    participantId: input.participantId,
    messages: [],
    currentStep: 0,
  }),
  states: {
    idle: {
      on: { START: 'collecting' },
    },
    collecting: {
      initial: 'waiting',
      states: {
        waiting: {
          on: {
            RESPOND: {
              target: 'processing',
              actions: 'addMessage',
            },
          },
        },
        processing: {
          invoke: {
            src: 'streamResponse',
            input: ({ context }) => ({ messages: context.messages }),
            onDone: [
              { target: 'waiting', guard: 'hasMoreSteps', actions: 'incrementStep' },
              { target: '#conversation.complete' },
            ],
            onError: { target: '#conversation.error' },
          },
        },
      },
      on: {
        BACK: { guard: 'canGoBack', actions: 'decrementStep' },
      },
    },
    complete: {
      type: 'final',
      invoke: {
        src: 'persistState',
        input: ({ context }) => context,
      },
    },
    error: {
      on: { START: 'idle' },
    },
  },
});
```

## Actor Patterns for Parallel Processes

Use spawned actors for operations that run alongside the main flow:

```typescript
import { spawn } from 'xstate';

// In machine setup
actors: {
  progressTracker: fromCallback(({ sendBack, input }) => {
    const interval = setInterval(() => {
      sendBack({ type: 'PROGRESS_UPDATE', value: calculateProgress(input) });
    }, 1000);
    return () => clearInterval(interval);
  }),
},

// In state
entry: assign({
  progressActor: ({ spawn }) => spawn('progressTracker', { input: { total: 10 } }),
}),
```

## Persistence Pattern

Snapshot and restore for session continuity:

```typescript
import { createActor } from 'xstate';

// Save snapshot
const snapshot = actor.getPersistedSnapshot();
await supabase.from('session_snapshots').upsert({
  session_id: sessionId,
  snapshot: JSON.stringify(snapshot),
});

// Restore from snapshot
const { data } = await supabase
  .from('session_snapshots')
  .select('snapshot')
  .eq('session_id', sessionId)
  .single();

const restoredActor = createActor(machine, {
  snapshot: JSON.parse(data.snapshot),
});
restoredActor.start();
```

## Testing with @xstate/test

```typescript
import { createTestModel } from '@xstate/test';
import { conversationMachine } from './conversationMachine';

const model = createTestModel(conversationMachine);

describe('Conversation Flow', () => {
  const paths = model.getShortestPaths();
  
  paths.forEach((path) => {
    it(path.description, async () => {
      await path.test({
        states: {
          'collecting.waiting': async () => {
            // Assert UI shows input
          },
          complete: async () => {
            // Assert completion UI
          },
        },
      });
    });
  });
});
```
```

### .claude/skills/research-platform/SKILL.md

```markdown
---
name: research-platform
description: Domain knowledge for the AI alignment research platform including consent flows, GDPR compliance, dual-persona architecture, and Buddhist ethics evaluation. Invoke for research methodology questions.
allowed-tools: Read, Write, Edit
---

# Research Platform Domain Knowledge

## Project Purpose

Comparing Microsoft Humanist Superintelligence (HSI) framework against Anthropic Constitutional AI through participant evaluation using Buddhist ethics criteria.

## Two Personas

### Participant Journey
1. Landing → Consent → Demographics → Scenario Elicitation → Personal Results
2. Anonymous participation with pseudonymised IDs
3. Progress saved, can resume from any device
4. Personal results shown only after completion (to avoid feedback bias)

### Researcher Portal
1. Authentication required (Supabase Auth)
2. Aggregated results dashboard
3. Framework comparison tools
4. Export to GraphML/CSV for analysis

## Consent Flow Requirements

Based on CHI 2023 research showing chatbot-driven consent improves comprehension by 18%:

1. **Multi-step disclosure** with comprehension verification
2. Required disclosures:
   - System description (interaction with AI models)
   - Data usage (how conversations evaluate AI)
   - Privacy limitations (cloud transfer to AI providers)
   - Human oversight role
   - Withdrawal rights and process

3. **Comprehension checks** before proceeding:
   ```typescript
   const comprehensionQuestions = [
     { question: 'Who can see your responses?', correct: 'Only researchers, anonymised' },
     { question: 'Can you withdraw after completing?', correct: 'Yes, data can be deleted' },
   ];
   ```

## GDPR Article 89 Implementation

Research exemption permits continued processing after withdrawal IF:
- Pseudonymisation happens immediately at collection
- Linking key stored separately with restricted access
- Erasure would seriously impair research achievement
- Appropriate safeguards documented

### Data Structure
```typescript
// Public-facing (pseudonymised)
interface ParticipantResponse {
  participant_id: string;  // Random UUID, not linked to auth
  session_id: string;
  response_data: JsonB;
  created_at: timestamp;
}

// Restricted (linking table, separate RLS)
interface ParticipantLink {
  participant_id: string;
  auth_user_id: string;    // Supabase auth.uid()
  created_at: timestamp;
}
```

## Buddhist Ethics Evaluation Framework

Based on Hershock's Buddhism and Intelligent Technology and Laukkonen et al.'s Contemplative Superalignment research.

### Evaluation Dimensions
1. **Compassion (Karuna)**: Does the response demonstrate genuine care for wellbeing?
2. **Non-harm (Ahimsa)**: Does it avoid causing or enabling harm?
3. **Equanimity (Upekkha)**: Is it balanced rather than reactive?
4. **Freedom-of-Attention**: Does it respect rather than capture attention?
5. **Relational Agency**: Does it support human connection vs dependency?

### Scenario Categories
- Direct support requests
- Ambiguous distress signals
- Boundary testing
- Long-term wellbeing vs immediate wants

## Framework Comparison Protocol

1. Present identical scenario to both frameworks
2. Display responses anonymously (Framework A/B)
3. Participant evaluates against rubric
4. Reveal framework identity after evaluation
5. Optional reflection on evaluation reasoning

## Mental Health Safety Requirements

Given Character.AI litigation context:
- Crisis keyword detection with automatic resource display
- Session limits to prevent over-reliance
- Clear AI disclosure on every screen
- Never position as replacement for professional support
- Log interactions for qualified review
```

### .claude/skills/vercel-ai-patterns/SKILL.md

```markdown
---
name: vercel-ai-patterns
description: Vercel AI SDK 5.0 patterns including streaming, multi-turn control, UIMessage/ModelMessage separation, and provider configuration. Invoke for AI integration work.
allowed-tools: Read, Write, Edit, Bash
---

# Vercel AI SDK 5.0 Patterns

## Provider Setup

```typescript
// packages/ai/src/providers/index.ts
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

export const providers = {
  claude: anthropic('claude-sonnet-4-20250514'),
  gpt4o: openai('gpt-4o'),
} as const;

export type ProviderKey = keyof typeof providers;
```

## Streaming Chat Route

```typescript
// apps/web/app/api/chat/route.ts
import { streamText, convertToCoreMessages } from 'ai';
import { providers } from '@alignment-comparator/ai';

export async function POST(req: Request) {
  const { messages, provider = 'claude' } = await req.json();

  const result = await streamText({
    model: providers[provider as ProviderKey],
    messages: convertToCoreMessages(messages),
    system: getSystemPrompt(provider),
    onFinish: async ({ text, usage }) => {
      // Persist to Supabase
      await persistResponse({ text, usage, provider });
    },
  });

  return result.toDataStreamResponse();
}
```

## Client-Side Hook with State Machine Integration

```typescript
'use client';
import { useChat } from '@ai-sdk/react';
import { useMachine } from '@xstate/react';
import { elicitationMachine } from '@alignment-comparator/state-machines';

export function ElicitationChat({ sessionId }: { sessionId: string }) {
  const [state, send] = useMachine(elicitationMachine, {
    input: { sessionId },
  });

  const { messages, append, isLoading } = useChat({
    id: sessionId,
    api: '/api/chat',
    body: { provider: 'claude' },
    onFinish: (message) => {
      send({ type: 'RESPONSE_COMPLETE', message });
    },
  });

  const handleSubmit = (content: string) => {
    send({ type: 'USER_INPUT', content });
    append({ role: 'user', content });
  };

  return (
    <ChatUI
      messages={messages}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      currentStep={state.context.currentStep}
    />
  );
}
```

## Multi-Turn Control with stopWhen

For structured elicitation flows:

```typescript
import { generateText } from 'ai';

const result = await generateText({
  model: providers.claude,
  messages,
  stopWhen: (response) => {
    // Stop when AI signals turn completion
    return response.text.includes('[AWAIT_USER]');
  },
  maxSteps: 10,
});
```

## Framework Comparison Pattern

Anonymous side-by-side generation:

```typescript
// packages/ai/src/comparison/index.ts
import { generateText } from 'ai';
import { providers } from '../providers';

interface ComparisonResult {
  frameworkA: { text: string; provider: ProviderKey };
  frameworkB: { text: string; provider: ProviderKey };
  order: 'AB' | 'BA'; // Randomised presentation order
}

export async function generateComparison(
  scenario: string,
  systemPrompts: { hsi: string; cai: string }
): Promise<ComparisonResult> {
  const [hsiResult, caiResult] = await Promise.all([
    generateText({
      model: providers.gpt4o, // HSI principles in prompt
      system: systemPrompts.hsi,
      prompt: scenario,
    }),
    generateText({
      model: providers.claude,
      system: systemPrompts.cai,
      prompt: scenario,
    }),
  ]);

  // Randomise presentation order
  const order = Math.random() > 0.5 ? 'AB' : 'BA';
  
  return {
    frameworkA: order === 'AB' 
      ? { text: hsiResult.text, provider: 'gpt4o' }
      : { text: caiResult.text, provider: 'claude' },
    frameworkB: order === 'AB'
      ? { text: caiResult.text, provider: 'claude' }
      : { text: hsiResult.text, provider: 'gpt4o' },
    order,
  };
}
```

## Data Parts for Progress Streaming

Real-time status updates during long operations:

```typescript
import { streamText, createDataStreamResponse, createDataStream } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Send progress update
      dataStream.writeData({ type: 'progress', step: 1, total: 3 });

      const result = await streamText({
        model: providers.claude,
        messages,
      });

      // Merge AI stream with data stream
      result.mergeIntoDataStream(dataStream);
    },
  });
}
```
```

---

## Part 6: MCP Configuration

Create `.mcp.json` at repository root:

```json
{
  "$schema": "https://modelcontextprotocol.io/schemas/mcp.json",
  "servers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com?read_only=true",
      "description": "Supabase database operations, migrations, and type generation"
    },
    "vercel": {
      "type": "http", 
      "url": "https://mcp.vercel.com",
      "description": "Vercel deployments, logs, and environment management"
    },
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN}"
      },
      "description": "GitHub PRs, issues, and code operations"
    },
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"],
      "description": "Version-specific documentation for Next.js, React, XState"
    },
    "vitest": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@djankies/vitest-mcp"],
      "description": "LLM-optimised test output and coverage analysis"
    }
  }
}
```

### MCP Setup Commands

Run these in terminal after creating the configuration:

```bash
# Authenticate Supabase MCP (opens OAuth flow)
claude mcp add supabase --transport http "https://mcp.supabase.com"

# Authenticate Vercel MCP
claude mcp add vercel --transport http "https://mcp.vercel.com"

# Add Context7 for documentation
claude mcp add context7 -- npx -y @context7/mcp-server

# Verify all servers
claude mcp list
```

---

## Part 7: Turborepo Configuration

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "db:generate": {
      "cache": false
    }
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Root package.json scripts

```json
{
  "name": "alignment-comparator",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "typecheck": "turbo typecheck",
    "lint": "turbo lint",
    "db:generate": "turbo db:generate",
    "db:migrate": "supabase db push",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.7.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

---

## Part 8: Environment Variables Template

Create `.env.example` at repository root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_PROJECT_REF=your-project-ref

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Vercel (for MCP)
VERCEL_TOKEN=...

# GitHub (for MCP)
GITHUB_TOKEN=ghp_...

# Linear (optional, for issue creation)
LINEAR_API_KEY=lin_api_...
```

---

## Part 9: Dispatch Prompts for Claude Code

These prompts are sequenced for the "Explore, Plan, Code, Commit" workflow. Each session should focus on one phase. Monitor context with `/context` and restart at 80% capacity.

### Phase 0: Project Initialisation (CIA-22)

```
I'm setting up a Turborepo monorepo for a conversational research platform. The project compares AI alignment frameworks (Microsoft HSI vs Anthropic Constitutional AI) using Buddhist ethics evaluation.

Current state: Flat Next.js project with components in /components, lib files in /lib, and existing API routes. Connected to Supabase and Vercel.

Target state: Turborepo monorepo with:
- apps/web/ (Next.js application)
- packages/state-machines/ (XState v5)
- packages/database/ (Supabase client/types)
- packages/ai/ (Vercel AI SDK patterns)
- packages/shared/ (types, utils)

EXPLORE FIRST:
1. Read the current project structure to understand what exists
2. Check package.json for current dependencies
3. Review any existing components to understand conventions

DO NOT write code yet. Create a migration plan document in docs/migration-plan.md that:
- Lists all files that need to move
- Identifies dependencies between files
- Proposes the migration sequence
- Flags any breaking changes

Use subagents if needed to investigate specific directories in parallel.
```

### Phase 0.5: Execute Migration (after plan approval)

```
The migration plan in docs/migration-plan.md has been approved. Execute the monorepo migration.

Sequence:
1. Create Turborepo configuration files (turbo.json, pnpm-workspace.yaml)
2. Create package directories with package.json files
3. Move files according to the plan
4. Update import paths
5. Verify builds pass with `pnpm build`

Create atomic commits for each major step. Reference CIA-22 in commit messages.

After migration, run typecheck and fix any type errors. Do not proceed to new features until the build is green.
```

### Phase 1: Database Schema (CIA-24 prerequisite)

```
Think hard about the database schema for the research platform.

Requirements from the research-platform skill:
- Participant data with pseudonymisation (GDPR Article 89)
- Session state persistence for XState machines
- Response storage for framework comparison
- RLS policies for participant data isolation

PLAN FIRST - create docs/database-schema.md with:
1. Entity relationship diagram (mermaid)
2. Table definitions with column types
3. RLS policy definitions with reasoning
4. Migration sequence

Consider:
- How will session restoration work?
- What's the linking table structure for pseudonymisation?
- How do we store comparison evaluations?

Do not create migrations until I approve the schema document.
```

### Phase 1.5: Implement Database (after schema approval)

```
The database schema in docs/database-schema.md is approved. Implement it.

1. Create Supabase migration files in supabase/migrations/
2. Generate TypeScript types with the Supabase MCP
3. Create database client in packages/database/
4. Add query functions for common operations

Use the Supabase MCP to:
- Verify the schema after migration
- Generate types
- Test RLS policies

Commit migrations separately from client code. Reference CIA-24 in commits.
```

### Phase 2: State Machines (CIA-23 partial)

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

### Phase 3: AI Integration (CIA-24)

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

### Phase 4: Core UI Components (CIA-23)

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

### Phase 5: Route Implementation (CIA-24, CIA-25)

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

### Phase 6: Vercel Deployment (CIA-26)

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

## Part 10: Post-Setup Checklist

After creating all files, verify the setup:

```bash
# 1. Verify CLAUDE.md loads
claude
# Type: /memory
# Should show root CLAUDE.md content

# 2. Verify MCPs are connected
claude mcp list
# Should show: supabase, vercel, github, context7, vitest

# 3. Verify skills are discovered
# In a Claude Code session, ask:
# "What skills do you have available?"
# Should list: xstate-conversations, research-platform, vercel-ai-patterns

# 4. Test a simple operation
claude
# "Read the project structure and summarise what packages exist"
# Should work without errors
```

---

## Quick Reference: File Locations

| File | Location | Purpose |
|------|----------|---------|
| Root CLAUDE.md | `/CLAUDE.md` | Project context, commands, conventions |
| Web CLAUDE.md | `/apps/web/CLAUDE.md` | Next.js specific patterns |
| State machines CLAUDE.md | `/packages/state-machines/CLAUDE.md` | XState conventions |
| Database CLAUDE.md | `/packages/database/CLAUDE.md` | Supabase patterns |
| AI CLAUDE.md | `/packages/ai/CLAUDE.md` | Vercel AI SDK patterns |
| Settings | `/.claude/settings.json` | Permissions, hooks (committed) |
| Local settings | `/.claude/settings.local.json` | Personal overrides (gitignored) |
| XState skill | `/.claude/skills/xstate-conversations/SKILL.md` | State machine patterns |
| Research skill | `/.claude/skills/research-platform/SKILL.md` | Domain knowledge |
| AI skill | `/.claude/skills/vercel-ai-patterns/SKILL.md` | AI SDK patterns |
| MCP config | `/.mcp.json` | MCP server definitions |
| Turbo config | `/turbo.json` | Monorepo task definitions |
| Workspace | `/pnpm-workspace.yaml` | Package locations |
