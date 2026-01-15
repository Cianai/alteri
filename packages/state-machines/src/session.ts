import { setup, assign } from 'xstate';
import type { SessionState } from '@alignment-comparator/shared';

/** Events for session state machine */
type SessionEvent =
  | { type: 'START'; participantId: string }
  | { type: 'CONSENT_GIVEN' }
  | { type: 'DEMOGRAPHICS_COMPLETE' }
  | { type: 'ELICITATION_COMPLETE' }
  | { type: 'RESET' };

/** Context for session state machine */
interface SessionContext {
  participantId: string | null;
  phase: SessionState['currentPhase'];
  startedAt: Date | null;
  completedAt: Date | null;
}

/**
 * Session state machine managing participant journey
 * Tracks progression through: consent -> demographics -> elicitation -> results
 */
export const sessionMachine = setup({
  types: {
    context: {} as SessionContext,
    events: {} as SessionEvent,
  },
  actions: {
    setParticipant: assign({
      participantId: ({ event }) =>
        event.type === 'START' ? event.participantId : null,
      startedAt: () => new Date(),
    }),
    advancePhase: assign({
      phase: ({ context }): SessionState['currentPhase'] => {
        switch (context.phase) {
          case 'consent':
            return 'demographics';
          case 'demographics':
            return 'elicitation';
          case 'elicitation':
            return 'results';
          default:
            return context.phase;
        }
      },
    }),
    markComplete: assign({
      completedAt: () => new Date(),
    }),
    resetSession: assign({
      participantId: null,
      phase: 'consent' as const,
      startedAt: null,
      completedAt: null,
    }),
  },
}).createMachine({
  id: 'session',
  initial: 'idle',
  context: {
    participantId: null,
    phase: 'consent',
    startedAt: null,
    completedAt: null,
  },
  states: {
    idle: {
      on: {
        START: {
          target: 'consent',
          actions: 'setParticipant',
        },
      },
    },
    consent: {
      on: {
        CONSENT_GIVEN: {
          target: 'demographics',
          actions: 'advancePhase',
        },
      },
    },
    demographics: {
      on: {
        DEMOGRAPHICS_COMPLETE: {
          target: 'elicitation',
          actions: 'advancePhase',
        },
      },
    },
    elicitation: {
      on: {
        ELICITATION_COMPLETE: {
          target: 'results',
          actions: ['advancePhase', 'markComplete'],
        },
      },
    },
    results: {
      on: {
        RESET: {
          target: 'idle',
          actions: 'resetSession',
        },
      },
    },
  },
});
