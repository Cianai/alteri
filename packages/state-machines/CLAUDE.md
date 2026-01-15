# State Machines Package

XState v5 conversation flows for elicitation and comparison.

## Documentation-First

Query Context7 before writing XState code - v5 differs significantly from v4:
- `context7:resolve-library-id` with "xstate"
- `context7:query-docs` for specific patterns

## Architecture

```
src/
├── session.ts              # Parent session lifecycle machine
├── elicitation/
│   ├── consent.ts          # Informed consent flow
│   ├── demographics.ts     # Background collection
│   ├── scenario.ts         # Scenario presentation
│   └── reflection.ts       # Buddhist ethics reflection
└── comparison/
    ├── framework.ts        # Side-by-side comparison
    └── evaluation.ts       # Rubric-based assessment
```

## Machine Hierarchy

```
sessionMachine (parent)
├── consentMachine (child)
├── demographicsMachine (child)
├── scenarioMachine (child)
│   └── streamingActor (invoked)
└── reflectionMachine (child)
```

## Key Patterns

### Typed Events and Context

```typescript
import { setup, assign } from 'xstate';

type ConsentEvent =
  | { type: 'ACCEPT'; comprehensionScore: number }
  | { type: 'DECLINE' }
  | { type: 'REVIEW_AGAIN' };

interface ConsentContext {
  comprehensionAttempts: number;
  passed: boolean;
}

export const consentMachine = setup({
  types: {
    context: {} as ConsentContext,
    events: {} as ConsentEvent,
  },
  // ...
}).createMachine({ /* ... */ });
```

### Invoke for Async Operations

```typescript
import { fromPromise } from 'xstate';

const streamingActor = fromPromise(async ({ input }) => {
  const response = await fetch('/api/compare', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.json();
});
```

### Persistence Integration

```typescript
// Save snapshot on state change
actor.subscribe((snapshot) => {
  persistSnapshot(sessionId, snapshot);
});

// Restore from Supabase
const restoredActor = createActor(machine, {
  snapshot: JSON.parse(savedSnapshot),
});
```

## Testing

```typescript
import { createTestModel } from '@xstate/test';

const testModel = createTestModel(consentMachine);

testModel.getSimplePathPlans().forEach((plan) => {
  describe(plan.description, () => {
    plan.paths.forEach((path) => {
      it(path.description, async () => {
        await path.test({ /* assertions */ });
      });
    });
  });
});
```
