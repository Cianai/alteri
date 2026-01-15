'use client'

import * as React from 'react'
import { useMachine } from '@xstate/react'
import { configMachine } from '@alignment-comparator/state-machines'
import type {
  ConfigRegistry,
  ThemeVariant,
  AvatarProvider,
  ChartStyle,
  AnimationIntensity,
  VariantId,
  FeatureFlags,
} from './registry'
import { loadConfig, saveConfig, clearConfig } from './storage'

/**
 * Configuration context provider.
 *
 * Wraps the app to provide:
 * - Current configuration state
 * - Methods to update config
 * - Automatic localStorage persistence
 *
 * @module lib/config/context
 */

/** Context value type */
interface ConfigContextValue {
  // Current state
  config: ConfigRegistry
  isDirty: boolean
  isLoading: boolean

  // Theme actions
  setTheme: (theme: ThemeVariant) => void

  // Prompt version actions
  setPromptVersion: (version: string) => void

  // Experiment actions
  setVariant: (variantId: VariantId) => void
  setExperiment: (experimentId: string | null) => void

  // Component toggle actions
  toggleAvatar: (enabled: boolean) => void
  setAvatarProvider: (provider: AvatarProvider) => void
  toggleAnimations: (enabled: boolean) => void
  setAnimationIntensity: (intensity: AnimationIntensity) => void
  toggleGuidedTour: (enabled: boolean) => void
  toggleReasoning: (visible: boolean) => void
  setChartStyle: (style: ChartStyle) => void

  // Feature flag actions
  toggleFeature: (feature: keyof FeatureFlags, enabled: boolean) => void

  // Persistence actions
  save: () => void
  reset: () => void
}

const ConfigContext = React.createContext<ConfigContextValue | null>(null)

interface ConfigProviderProps {
  children: React.ReactNode
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [state, send] = useMachine(configMachine)
  const [isLoading, setIsLoading] = React.useState(true)

  // Load config from localStorage on mount
  React.useEffect(() => {
    const stored = loadConfig()
    send({
      type: 'LOAD',
      config: {
        theme: stored.theme,
        components: stored.components,
        promptVersion: stored.promptVersion,
        experimentId: stored.experimentId,
        variantId: stored.variantId,
        features: stored.features,
      },
    })
    setIsLoading(false)
  }, [send])

  // Auto-save on changes (debounced)
  React.useEffect(() => {
    if (state.context.isDirty && !isLoading) {
      const timeout = setTimeout(() => {
        const configToSave: ConfigRegistry = {
          theme: state.context.theme,
          components: state.context.components,
          promptVersion: state.context.promptVersion,
          experimentId: state.context.experimentId ?? undefined,
          variantId: state.context.variantId,
          features: state.context.features,
          updatedAt: new Date().toISOString(),
        }
        saveConfig(configToSave)
        send({ type: 'SAVE' })
      }, 500)

      return () => clearTimeout(timeout)
    }
    return undefined
  }, [state.context, isLoading, send])

  // Build the current config object
  const config: ConfigRegistry = React.useMemo(
    () => ({
      theme: state.context.theme,
      components: state.context.components,
      promptVersion: state.context.promptVersion,
      experimentId: state.context.experimentId ?? undefined,
      variantId: state.context.variantId,
      features: state.context.features,
      updatedAt: state.context.lastSaved?.toISOString() ?? new Date().toISOString(),
    }),
    [state.context]
  )

  // Action handlers
  const value: ConfigContextValue = React.useMemo(
    () => ({
      config,
      isDirty: state.context.isDirty,
      isLoading,

      setTheme: (theme) => send({ type: 'SET_THEME', theme }),
      setPromptVersion: (version) => send({ type: 'SET_PROMPT_VERSION', version }),
      setVariant: (variantId) => send({ type: 'SET_VARIANT', variantId }),
      setExperiment: (experimentId) => send({ type: 'SET_EXPERIMENT', experimentId }),

      toggleAvatar: (enabled) => send({ type: 'TOGGLE_AVATAR', enabled }),
      setAvatarProvider: (provider) => send({ type: 'SET_AVATAR_PROVIDER', provider }),
      toggleAnimations: (enabled) => send({ type: 'TOGGLE_ANIMATIONS', enabled }),
      setAnimationIntensity: (intensity) => send({ type: 'SET_ANIMATION_INTENSITY', intensity }),
      toggleGuidedTour: (enabled) => send({ type: 'TOGGLE_GUIDED_TOUR', enabled }),
      toggleReasoning: (visible) => send({ type: 'TOGGLE_REASONING', visible }),
      setChartStyle: (style) => send({ type: 'SET_CHART_STYLE', style }),

      toggleFeature: (feature, enabled) => send({ type: 'TOGGLE_FEATURE', feature, enabled }),

      save: () => {
        const configToSave: ConfigRegistry = {
          theme: state.context.theme,
          components: state.context.components,
          promptVersion: state.context.promptVersion,
          experimentId: state.context.experimentId ?? undefined,
          variantId: state.context.variantId,
          features: state.context.features,
          updatedAt: new Date().toISOString(),
        }
        saveConfig(configToSave)
        send({ type: 'SAVE' })
      },

      reset: () => {
        clearConfig()
        send({ type: 'RESET' })
      },
    }),
    [config, isLoading, send, state.context]
  )

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

/**
 * Hook to access configuration context.
 * Must be used within a ConfigProvider.
 */
export function useConfig(): ConfigContextValue {
  const context = React.useContext(ConfigContext)
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}

/**
 * Hook to access only the current config (no actions).
 * Useful for components that only need to read config.
 */
export function useConfigValue(): ConfigRegistry {
  const { config } = useConfig()
  return config
}

/**
 * Hook to check if a feature is enabled.
 */
export function useFeature(feature: keyof FeatureFlags): boolean {
  const { config } = useConfig()
  return config.features[feature]
}

/**
 * Hook to get the current theme.
 */
export function useTheme(): ThemeVariant {
  const { config } = useConfig()
  return config.theme
}
