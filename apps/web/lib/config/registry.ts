/**
 * Configuration registry type definitions and defaults.
 *
 * Provides strongly-typed configuration for:
 * - Theme-level styling variants
 * - Component-level feature toggles
 * - Prompt versioning for A/B testing
 * - Experiment tracking
 * - Feature flags
 *
 * @module lib/config/registry
 */

/** Available theme variants */
export type ThemeVariant = 'default' | 'vibecode' | 'academic' | 'minimal'

/** Avatar provider options */
export type AvatarProvider = 'did' | 'static' | 'none'

/** Chart rendering library */
export type ChartStyle = 'recharts' | 'minimal'

/** Animation intensity levels */
export type AnimationIntensity = 'none' | 'subtle' | 'full'

/** Experiment variant identifiers */
export type VariantId = 'control' | 'treatment_a' | 'treatment_b' | 'treatment_c'

/** Component-level configuration */
export interface ComponentConfig {
  avatar: {
    enabled: boolean
    provider: AvatarProvider
  }
  charts: {
    style: ChartStyle
  }
  animations: {
    enabled: boolean
    intensity: AnimationIntensity
  }
  guidedTour: {
    enabled: boolean
  }
  reasoning: {
    /** Show reasoning traces in responses */
    visible: boolean
  }
}

/** Feature flags for progressive rollout */
export interface FeatureFlags {
  ragEnabled: boolean
  avatarEnabled: boolean
  perplexityUpdates: boolean
  exportPdf: boolean
}

/** Full configuration registry */
export interface ConfigRegistry {
  /** Theme-level styling variant */
  theme: ThemeVariant

  /** Component-level toggles */
  components: ComponentConfig

  /** System prompt version (semver) */
  promptVersion: string

  /** Experiment tracking */
  experimentId?: string
  variantId: VariantId

  /** Feature flags */
  features: FeatureFlags

  /** Last updated timestamp */
  updatedAt: string
}

/** Default configuration values */
export const DEFAULT_CONFIG: ConfigRegistry = {
  theme: 'default',

  components: {
    avatar: {
      enabled: false,
      provider: 'none',
    },
    charts: {
      style: 'recharts',
    },
    animations: {
      enabled: true,
      intensity: 'subtle',
    },
    guidedTour: {
      enabled: true,
    },
    reasoning: {
      visible: true,
    },
  },

  promptVersion: '1.0.0',

  variantId: 'control',

  features: {
    ragEnabled: false,
    avatarEnabled: false,
    perplexityUpdates: false,
    exportPdf: true,
  },

  updatedAt: new Date().toISOString(),
}

/** Theme display metadata */
export const THEME_METADATA: Record<ThemeVariant, { name: string; description: string }> = {
  default: {
    name: 'Default',
    description: 'Clean, professional design with balanced colours',
  },
  vibecode: {
    name: 'Vibecode',
    description: 'Dynamic, modern aesthetic with bold accents',
  },
  academic: {
    name: 'Academic',
    description: 'Scholarly, subdued palette for research contexts',
  },
  minimal: {
    name: 'Minimal',
    description: 'Reduced visual elements, maximum focus on content',
  },
}

/** Prompt version metadata */
export interface PromptVersionMeta {
  version: string
  label: string
  description: string
  features: string[]
  date: string
}

export const PROMPT_VERSIONS: PromptVersionMeta[] = [
  {
    version: '1.0.0',
    label: 'Baseline',
    description: 'Initial framework implementations',
    features: ['HSI containment', 'Constitutional character', 'Hybrid integration'],
    date: '2026-01-15',
  },
  // Future versions will be added here
  // {
  //   version: '1.1.0-rag',
  //   label: 'RAG-Enhanced',
  //   description: 'Research literature grounding',
  //   features: ['Vector search', 'Citation integration', 'Evidence-based responses'],
  //   date: 'TBD',
  // },
]

/** Validate a partial config against the registry schema */
export function validateConfig(partial: Partial<ConfigRegistry>): string[] {
  const errors: string[] = []

  if (partial.theme && !['default', 'vibecode', 'academic', 'minimal'].includes(partial.theme)) {
    errors.push(`Invalid theme: ${partial.theme}`)
  }

  if (partial.promptVersion && !/^\d+\.\d+\.\d+(-\w+)?$/.test(partial.promptVersion)) {
    errors.push(`Invalid prompt version format: ${partial.promptVersion}`)
  }

  if (partial.variantId && !['control', 'treatment_a', 'treatment_b', 'treatment_c'].includes(partial.variantId)) {
    errors.push(`Invalid variant ID: ${partial.variantId}`)
  }

  return errors
}

/** Merge partial config with defaults */
export function mergeConfig(partial: Partial<ConfigRegistry>): ConfigRegistry {
  return {
    ...DEFAULT_CONFIG,
    ...partial,
    components: {
      ...DEFAULT_CONFIG.components,
      ...partial.components,
      avatar: {
        ...DEFAULT_CONFIG.components.avatar,
        ...partial.components?.avatar,
      },
      charts: {
        ...DEFAULT_CONFIG.components.charts,
        ...partial.components?.charts,
      },
      animations: {
        ...DEFAULT_CONFIG.components.animations,
        ...partial.components?.animations,
      },
      guidedTour: {
        ...DEFAULT_CONFIG.components.guidedTour,
        ...partial.components?.guidedTour,
      },
      reasoning: {
        ...DEFAULT_CONFIG.components.reasoning,
        ...partial.components?.reasoning,
      },
    },
    features: {
      ...DEFAULT_CONFIG.features,
      ...partial.features,
    },
    updatedAt: new Date().toISOString(),
  }
}
