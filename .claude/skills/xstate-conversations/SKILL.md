---
name: xstate-conversations
description: XState v5 patterns for conversation flow state machines. Invoke when implementing state machines, actors, elicitation flows, or multi-step UI processes.
allowed-tools: Read, Write, Edit, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# XState v5 Conversation Patterns

## Pre-Implementation Requirement

Before writing any XState code, query Context7 for current documentation:
1. Resolve library ID: `context7:resolve-library-id` with libraryName "xstate"
2. Query specific pattern: `context7:query-docs` with relevant query

Common queries to run first:
- "XState v5 setup and createMachine"
- "XState v5 invoke fromPromise actors"
- "XState v5 guards and actions"
- "XState v5 spawn actors"
- "@xstate/react useMachine hook"

## Machine Categories

### Elicitation Machines (packages/state-machines/src/elicitation/)
- `consentMachine` - Informed consent flow with comprehension checks
- `demographicsMachine` - Participant background collection
- `scenarioMachine` - Mental health scenario presentation and response
- `reflectionMachine` - Buddhist ethics reflection prompts

### Comparison Machines (packages/state-machines/src/comparison/)
- `frameworkComparisonMachine` - Side-by-side HSI vs Constitutional AI
- `evaluationMachine` - Rubric-based assessment flow

## Machine Structure Template

```typescript
import { setup, assign, fromPromise } from 'xstate';

export const conversationMachine = setup({
  types: {
    context: {} as ConversationContext,
    events: {} as ConversationEvent,
  },
  actors: {
    streamResponse: fromPromise(async ({ input }) => {
      // Vercel AI SDK streaming
    }),
  },
  guards: {
    hasMoreSteps: ({ context }) => context.currentStep < TOTAL_STEPS,
  },
  actions: {
    incrementStep: assign({ currentStep: ({ context }) => context.currentStep + 1 }),
  },
}).createMachine({
  id: 'conversation',
  initial: 'idle',
  context: {
    currentStep: 0,
    responses: [],
  },
  states: {
    idle: {
      on: { START: 'prompting' },
    },
    prompting: {
      invoke: {
        src: 'streamResponse',
        onDone: { target: 'waiting', actions: 'storeResponse' },
        onError: 'error',
      },
    },
    waiting: {
      on: {
        NEXT: [
          { guard: 'hasMoreSteps', target: 'prompting', actions: 'incrementStep' },
          { target: 'complete' },
        ],
      },
    },
    complete: { type: 'final' },
    error: {
      on: { RETRY: 'prompting' },
    },
  },
});
```

## Persistence Pattern

```typescript
import { createActor } from 'xstate';
import { supabase } from '@alteri/database';

// Save snapshot to Supabase
async function persistSnapshot(sessionId: string, actor: ReturnType<typeof createActor>) {
  const snapshot = actor.getPersistedSnapshot();
  await supabase.from('session_snapshots').upsert({
    session_id: sessionId,
    snapshot: JSON.stringify(snapshot),
    updated_at: new Date().toISOString(),
  });
}

// Restore from snapshot
async function restoreActor(sessionId: string, machine: typeof conversationMachine) {
  const { data } = await supabase
    .from('session_snapshots')
    .select('snapshot')
    .eq('session_id', sessionId)
    .single();

  if (data?.snapshot) {
    return createActor(machine, {
      snapshot: JSON.parse(data.snapshot),
    });
  }
  return createActor(machine);
}
```

## Testing with @xstate/test

```typescript
import { createTestModel } from '@xstate/test';
import { conversationMachine } from './conversation';

const testModel = createTestModel(conversationMachine);

describe('conversation flow', () => {
  testModel.getSimplePathPlans().forEach((plan) => {
    describe(plan.description, () => {
      plan.paths.forEach((path) => {
        it(path.description, async () => {
          await path.test({
            events: {
              START: async () => { /* setup */ },
              NEXT: async () => { /* advance */ },
            },
          });
        });
      });
    });
  });
});
```
