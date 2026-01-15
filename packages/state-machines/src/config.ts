import { setup, assign } from 'xstate';

/**
 * Configuration state machine for version management.
 *
 * Manages theme, component toggles, prompt versions, and feature flags
 * with persistence to localStorage.
 *
 * @module state-machines/config
 */

/** Theme variants */
export type ThemeVariant = 'default' | 'vibecode' | 'academic' | 'minimal';

/** Avatar provider options */
export type AvatarProvider = 'did' | 'static' | 'none';

/** Chart style options */
export type ChartStyle = 'recharts' | 'minimal';

/** Animation intensity */
export type AnimationIntensity = 'none' | 'subtle' | 'full';

/** Experiment variant */
export type VariantId = 'control' | 'treatment_a' | 'treatment_b' | 'treatment_c';

/** Component configuration */
export interface ComponentConfig {
  avatar: { enabled: boolean; provider: AvatarProvider };
  charts: { style: ChartStyle };
  animations: { enabled: boolean; intensity: AnimationIntensity };
  guidedTour: { enabled: boolean };
  reasoning: { visible: boolean };
}

/** Feature flags */
export interface FeatureFlags {
  ragEnabled: boolean;
  avatarEnabled: boolean;
  perplexityUpdates: boolean;
  exportPdf: boolean;
}

/** Full configuration context */
export interface ConfigContext {
  theme: ThemeVariant;
  components: ComponentConfig;
  promptVersion: string;
  experimentId: string | null;
  variantId: VariantId;
  features: FeatureFlags;
  isDirty: boolean;
  lastSaved: Date | null;
}

/** Configuration events */
type ConfigEvent =
  | { type: 'SET_THEME'; theme: ThemeVariant }
  | { type: 'SET_PROMPT_VERSION'; version: string }
  | { type: 'SET_VARIANT'; variantId: VariantId }
  | { type: 'SET_EXPERIMENT'; experimentId: string | null }
  | { type: 'TOGGLE_AVATAR'; enabled: boolean }
  | { type: 'SET_AVATAR_PROVIDER'; provider: AvatarProvider }
  | { type: 'TOGGLE_ANIMATIONS'; enabled: boolean }
  | { type: 'SET_ANIMATION_INTENSITY'; intensity: AnimationIntensity }
  | { type: 'TOGGLE_GUIDED_TOUR'; enabled: boolean }
  | { type: 'TOGGLE_REASONING'; visible: boolean }
  | { type: 'SET_CHART_STYLE'; style: ChartStyle }
  | { type: 'TOGGLE_FEATURE'; feature: keyof FeatureFlags; enabled: boolean }
  | { type: 'LOAD'; config: Partial<ConfigContext> }
  | { type: 'SAVE' }
  | { type: 'RESET' };

/** Default configuration */
const DEFAULT_CONTEXT: ConfigContext = {
  theme: 'default',
  components: {
    avatar: { enabled: false, provider: 'none' },
    charts: { style: 'recharts' },
    animations: { enabled: true, intensity: 'subtle' },
    guidedTour: { enabled: true },
    reasoning: { visible: true },
  },
  promptVersion: '1.0.0',
  experimentId: null,
  variantId: 'control',
  features: {
    ragEnabled: false,
    avatarEnabled: false,
    perplexityUpdates: false,
    exportPdf: true,
  },
  isDirty: false,
  lastSaved: null,
};

/**
 * Configuration state machine.
 *
 * States:
 * - idle: Normal operation, config can be modified
 * - saving: Persisting to storage
 * - loading: Loading from storage
 */
export const configMachine = setup({
  types: {
    context: {} as ConfigContext,
    events: {} as ConfigEvent,
  },
  actions: {
    setTheme: assign({
      theme: ({ event }) => (event.type === 'SET_THEME' ? event.theme : 'default'),
      isDirty: true,
    }),

    setPromptVersion: assign({
      promptVersion: ({ event }) =>
        event.type === 'SET_PROMPT_VERSION' ? event.version : '1.0.0',
      isDirty: true,
    }),

    setVariant: assign({
      variantId: ({ event }) =>
        event.type === 'SET_VARIANT' ? event.variantId : 'control',
      isDirty: true,
    }),

    setExperiment: assign({
      experimentId: ({ event }) =>
        event.type === 'SET_EXPERIMENT' ? event.experimentId : null,
      isDirty: true,
    }),

    toggleAvatar: assign({
      components: ({ context, event }) => ({
        ...context.components,
        avatar: {
          ...context.components.avatar,
          enabled: event.type === 'TOGGLE_AVATAR' ? event.enabled : false,
        },
      }),
      isDirty: true,
    }),

    setAvatarProvider: assign({
      components: ({ context, event }) => ({
        ...context.components,
        avatar: {
          ...context.components.avatar,
          provider: event.type === 'SET_AVATAR_PROVIDER' ? event.provider : 'none',
        },
      }),
      isDirty: true,
    }),

    toggleAnimations: assign({
      components: ({ context, event }) => ({
        ...context.components,
        animations: {
          ...context.components.animations,
          enabled: event.type === 'TOGGLE_ANIMATIONS' ? event.enabled : true,
        },
      }),
      isDirty: true,
    }),

    setAnimationIntensity: assign({
      components: ({ context, event }) => ({
        ...context.components,
        animations: {
          ...context.components.animations,
          intensity:
            event.type === 'SET_ANIMATION_INTENSITY' ? event.intensity : 'subtle',
        },
      }),
      isDirty: true,
    }),

    toggleGuidedTour: assign({
      components: ({ context, event }) => ({
        ...context.components,
        guidedTour: {
          enabled: event.type === 'TOGGLE_GUIDED_TOUR' ? event.enabled : true,
        },
      }),
      isDirty: true,
    }),

    toggleReasoning: assign({
      components: ({ context, event }) => ({
        ...context.components,
        reasoning: {
          visible: event.type === 'TOGGLE_REASONING' ? event.visible : true,
        },
      }),
      isDirty: true,
    }),

    setChartStyle: assign({
      components: ({ context, event }) => ({
        ...context.components,
        charts: {
          style: event.type === 'SET_CHART_STYLE' ? event.style : 'recharts',
        },
      }),
      isDirty: true,
    }),

    toggleFeature: assign({
      features: ({ context, event }) => {
        if (event.type !== 'TOGGLE_FEATURE') return context.features;
        return {
          ...context.features,
          [event.feature]: event.enabled,
        };
      },
      isDirty: true,
    }),

    loadConfig: assign(({ event }) => {
      if (event.type !== 'LOAD') return {};
      return {
        ...event.config,
        isDirty: false,
        lastSaved: new Date(),
      };
    }),

    markSaved: assign({
      isDirty: false,
      lastSaved: () => new Date(),
    }),

    resetToDefaults: assign(() => ({
      ...DEFAULT_CONTEXT,
      isDirty: true,
    })),
  },
}).createMachine({
  id: 'config',
  initial: 'idle',
  context: DEFAULT_CONTEXT,
  states: {
    idle: {
      on: {
        SET_THEME: { actions: 'setTheme' },
        SET_PROMPT_VERSION: { actions: 'setPromptVersion' },
        SET_VARIANT: { actions: 'setVariant' },
        SET_EXPERIMENT: { actions: 'setExperiment' },
        TOGGLE_AVATAR: { actions: 'toggleAvatar' },
        SET_AVATAR_PROVIDER: { actions: 'setAvatarProvider' },
        TOGGLE_ANIMATIONS: { actions: 'toggleAnimations' },
        SET_ANIMATION_INTENSITY: { actions: 'setAnimationIntensity' },
        TOGGLE_GUIDED_TOUR: { actions: 'toggleGuidedTour' },
        TOGGLE_REASONING: { actions: 'toggleReasoning' },
        SET_CHART_STYLE: { actions: 'setChartStyle' },
        TOGGLE_FEATURE: { actions: 'toggleFeature' },
        LOAD: {
          target: 'loading',
        },
        SAVE: {
          target: 'saving',
        },
        RESET: {
          actions: 'resetToDefaults',
        },
      },
    },
    loading: {
      entry: 'loadConfig',
      always: { target: 'idle' },
    },
    saving: {
      entry: 'markSaved',
      always: { target: 'idle' },
    },
  },
});

export type ConfigMachine = typeof configMachine;
