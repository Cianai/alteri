# AI Package

Vercel AI SDK 4.0 patterns for streaming, multi-turn conversations, and framework comparison.

## Documentation-First

Query Context7 before implementing - the SDK evolves rapidly:
- `context7:resolve-library-id` with "ai"
- `context7:query-docs` for specific patterns

## Key Patterns

### UIMessage vs ModelMessage Separation

The SDK distinguishes between:
- **UIMessage**: What's displayed to users (includes metadata, timestamps)
- **ModelMessage**: What's sent to the model (stripped down)

```typescript
import { convertToUIMessages } from 'ai';

// Convert model responses to UI format
const uiMessages = convertToUIMessages(modelMessages);
```

### Anonymous Framework Comparison

Prevent brand bias by not revealing which framework generated which response:

```typescript
export async function generateComparison(scenario: string) {
  const [hsi, cai] = await Promise.all([
    generateText({ model: providers.gpt4o, system: hsiPrompt, prompt: scenario }),
    generateText({ model: providers.claude, system: caiPrompt, prompt: scenario }),
  ]);

  // Randomise presentation
  const order = Math.random() > 0.5 ? 'AB' : 'BA';
  return {
    frameworkA: order === 'AB' ? hsi.text : cai.text,
    frameworkB: order === 'AB' ? cai.text : hsi.text,
    order, // Stored for later reveal
  };
}
```

### Multi-Turn Control

```typescript
import { streamText } from 'ai';

const result = await streamText({
  model: providers.claude,
  system: elicitationPrompt,
  messages: conversationHistory,
  maxSteps: 5, // Limit conversation depth
  stopWhen: ({ text }) => text.includes('[END_ELICITATION]'),
});
```

## Provider Configuration

```typescript
// src/providers.ts
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

export const providers = {
  claude: anthropic('claude-sonnet-4-20250514'),
  gpt4o: openai('gpt-4o'),
} as const;
```

## Error Handling

```typescript
try {
  const result = await generateText({ /* ... */ });
  return result.text;
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('rate_limit')) {
      // Exponential backoff
      await delay(Math.pow(2, attempt) * 1000);
      return retry();
    }
    if (error.message.includes('context_length')) {
      // Truncate history
      return generateWithTruncatedHistory();
    }
  }
  throw error;
}
```

## System Prompts

System prompts are stored in `apps/web/lib/prompts.ts` and encode specific alignment philosophies:
- HSI: Domain containment, human-in-loop, interpretability
- Constitutional AI: Principal hierarchy, anti-sycophancy, psychological stability
- Hybrid: Architectural containment with character depth

**Do not modify without explicit instruction** - they are versioned for research reproducibility.
