---
name: vercel-ai-patterns
description: Vercel AI SDK 4.0 patterns for streaming, multi-turn conversations, and function calling. Invoke for AI integration, chat interfaces, and LLM provider configuration.
allowed-tools: Read, Write, Edit, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Vercel AI SDK 4.0 Patterns

## Pre-Implementation Requirement

Before writing any AI SDK code, query Context7 for current documentation:
1. Resolve library ID: `context7:resolve-library-id` with libraryName "ai"
2. Query specific pattern needed

Essential queries:
- "Vercel AI SDK streamText with tools"
- "Vercel AI SDK useChat hook options"
- "Vercel AI SDK generateText with system prompt"
- "Vercel AI SDK provider configuration"

## Provider Setup

```typescript
// packages/ai/src/providers.ts
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

export const providers = {
  /** Claude for Constitutional AI evaluation */
  claude: anthropic('claude-sonnet-4-20250514'),
  /** GPT-4o for HSI framework evaluation */
  gpt4o: openai('gpt-4o'),
} as const;

export type ProviderKey = keyof typeof providers;
```

## Streaming Response Pattern

```typescript
// apps/web/app/api/compare/route.ts
import { streamText } from 'ai';
import { providers } from '@alteri/ai';

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

## Framework Comparison Pattern

Anonymous side-by-side generation:

```typescript
// packages/ai/src/comparison.ts
import { generateText } from 'ai';
import { providers } from './providers';

export async function generateComparison(scenario: string) {
  const [hsiResult, caiResult] = await Promise.all([
    generateText({
      model: providers.gpt4o,
      system: hsiPrompt,
      prompt: scenario,
    }),
    generateText({
      model: providers.claude,
      system: caiPrompt,
      prompt: scenario,
    }),
  ]);

  // Randomise to prevent brand bias
  const order = Math.random() > 0.5 ? 'AB' : 'BA';
  return {
    frameworkA: order === 'AB' ? hsiResult.text : caiResult.text,
    frameworkB: order === 'AB' ? caiResult.text : hsiResult.text,
    order,
  };
}
```

## Client-Side Chat Integration

```typescript
// apps/web/components/elicitation-chat.tsx
'use client';

import { useChat } from 'ai/react';

export function ElicitationChat({ sessionId }: { sessionId: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/elicit',
    body: { sessionId },
    onFinish: (message) => {
      // Persist to state machine
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      {messages.map((m) => (
        <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
          {m.content}
        </div>
      ))}
      <input
        value={input}
        onChange={handleInputChange}
        disabled={isLoading}
        placeholder="Your response..."
      />
    </form>
  );
}
```

## Multi-Turn with Tools

```typescript
import { streamText, tool } from 'ai';
import { z } from 'zod';

const result = await streamText({
  model: providers.claude,
  system: elicitationPrompt,
  messages: conversationHistory,
  tools: {
    saveResponse: tool({
      description: 'Save participant response to database',
      parameters: z.object({
        questionId: z.string(),
        response: z.string(),
        sentiment: z.enum(['positive', 'negative', 'neutral']),
      }),
      execute: async ({ questionId, response, sentiment }) => {
        await saveToDatabase({ questionId, response, sentiment });
        return { saved: true };
      },
    }),
  },
});
```

## Error Handling

```typescript
try {
  const result = await generateText({ /* ... */ });
  return result.text;
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('rate_limit')) {
      // Implement exponential backoff
    }
    if (error.message.includes('context_length')) {
      // Truncate conversation history
    }
  }
  throw error;
}
```
