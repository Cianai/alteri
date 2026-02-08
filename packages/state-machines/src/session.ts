import { setup, assign } from 'xstate';
import type {
  SessionPhase,
  DemographicsData,
  NetworkData,
} from '@alteri/shared';

/** Events for session state machine */
type SessionEvent =
  | { type: 'START'; participantId: string }
  | { type: 'CONSENT_GIVEN' }
  | { type: 'DEMOGRAPHICS_COMPLETE'; data: DemographicsData }
  | { type: 'NETWORK_COMPLETE'; data: NetworkData }
  | { type: 'COMPARISON_COMPLETE' }
  | { type: 'REFLECTION_COMPLETE' }
  | { type: 'RESET' };

/** Context for session state machine */
interface SessionContext {
  participantId: string | null;
  phase: SessionPhase;
  startedAt: Date | null;
  completedAt: Date | null;
  demographics: DemographicsData | null;
  network: NetworkData | null;
}

/**
 * Session state machine managing participant journey.
 *
 * Flow: consent -> demographics -> network-elicitation -> comparison -> reflection -> results
 *
 * @see packages/state-machines/CLAUDE.md for patterns
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
    saveDemographics: assign({
      demographics: ({ event }) =>
        event.type === 'DEMOGRAPHICS_COMPLETE' ? event.data : null,
      phase: 'network-elicitation' as SessionPhase,
    }),
    saveNetwork: assign({
      network: ({ event }) =>
        event.type === 'NETWORK_COMPLETE' ? event.data : null,
      phase: 'comparison' as SessionPhase,
    }),
    advanceToReflection: assign({
      phase: 'reflection' as SessionPhase,
    }),
    advanceToResults: assign({
      phase: 'results' as SessionPhase,
      completedAt: () => new Date(),
    }),
    resetSession: assign({
      participantId: null,
      phase: 'consent' as SessionPhase,
      startedAt: null,
      completedAt: null,
      demographics: null,
      network: null,
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
    demographics: null,
    network: null,
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
        },
      },
      entry: assign({ phase: 'consent' as SessionPhase }),
    },
    demographics: {
      on: {
        DEMOGRAPHICS_COMPLETE: {
          target: 'networkElicitation',
          actions: 'saveDemographics',
        },
      },
      entry: assign({ phase: 'demographics' as SessionPhase }),
    },
    networkElicitation: {
      on: {
        NETWORK_COMPLETE: {
          target: 'comparison',
          actions: 'saveNetwork',
        },
      },
      entry: assign({ phase: 'network-elicitation' as SessionPhase }),
    },
    comparison: {
      on: {
        COMPARISON_COMPLETE: {
          target: 'reflection',
          actions: 'advanceToReflection',
        },
      },
      entry: assign({ phase: 'comparison' as SessionPhase }),
    },
    reflection: {
      on: {
        REFLECTION_COMPLETE: {
          target: 'results',
          actions: 'advanceToResults',
        },
      },
      entry: assign({ phase: 'reflection' as SessionPhase }),
    },
    results: {
      on: {
        RESET: {
          target: 'idle',
          actions: 'resetSession',
        },
      },
      entry: assign({ phase: 'results' as SessionPhase }),
    },
  },
});
