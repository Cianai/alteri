'use client'

import { useState, useCallback, useEffect } from 'react'
import { Model, type ITheme } from 'survey-core'
import { Survey } from 'survey-react-ui'
import 'survey-core/survey-core.css'

/**
 * Custom theme matching alignment-comparator design system.
 * Uses CSS variables that integrate with Tailwind and framework colours.
 */
const alignmentTheme: ITheme = {
  themeName: 'alignment-comparator',
  colorPalette: 'light',
  isPanelless: false,
  cssVariables: {
    // Primary colours - using neutral for default, frameworks override per-survey
    '--sjs-primary-backcolor': 'hsl(240 5% 26%)',
    '--sjs-primary-backcolor-dark': 'hsl(240 6% 10%)',
    '--sjs-primary-backcolor-light': 'hsl(240 5% 34%)',
    '--sjs-primary-forecolor': 'hsl(0 0% 98%)',

    // Secondary/background colours
    '--sjs-secondary-backcolor': 'hsl(0 0% 98%)',
    '--sjs-secondary-backcolor-light': 'hsl(0 0% 100%)',
    '--sjs-secondary-backcolor-semi-light': 'hsl(240 5% 96%)',
    '--sjs-secondary-forecolor': 'hsl(240 6% 10%)',

    // Base unit and spacing (8px base matches Tailwind)
    '--sjs-base-unit': '8px',
    '--sjs-corner-radius': '6px',

    // Typography - matching Tailwind defaults
    '--sjs-font-family': 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
    '--sjs-font-size': '16px',
    '--sjs-font-questiontitle-size': '18px',
    '--sjs-font-questiontitle-weight': '600',

    // Question spacing
    '--sjs-question-vertical-margin': '24px',

    // Borders
    '--sjs-border-default': 'hsl(240 6% 90%)',
    '--sjs-border-light': 'hsl(240 5% 96%)',

    // Validation colours
    '--sjs-special-red': 'hsl(0 84% 60%)',
    '--sjs-special-green': 'hsl(142 76% 36%)',
    '--sjs-special-yellow': 'hsl(38 92% 50%)',

    // Shadows
    '--sjs-shadow-small': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '--sjs-shadow-medium': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    '--sjs-shadow-large': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
}

/**
 * Framework-specific theme overrides.
 * Apply primary colour from framework colour scales.
 */
const frameworkThemes = {
  hsi: {
    '--sjs-primary-backcolor': 'hsl(217 91% 60%)',
    '--sjs-primary-backcolor-dark': 'hsl(217 91% 50%)',
    '--sjs-primary-backcolor-light': 'hsl(217 91% 70%)',
  },
  constitutional: {
    '--sjs-primary-backcolor': 'hsl(25 95% 53%)',
    '--sjs-primary-backcolor-dark': 'hsl(25 95% 43%)',
    '--sjs-primary-backcolor-light': 'hsl(25 95% 63%)',
  },
  hybrid: {
    '--sjs-primary-backcolor': 'hsl(142 76% 36%)',
    '--sjs-primary-backcolor-dark': 'hsl(142 76% 26%)',
    '--sjs-primary-backcolor-light': 'hsl(142 76% 46%)',
  },
} as const

export type FrameworkTheme = keyof typeof frameworkThemes | 'neutral'

export interface SurveyWrapperProps {
  /** JSON survey definition following SurveyJS schema */
  surveyJson: object
  /** Optional framework theme to apply (hsi, constitutional, hybrid, or neutral) */
  frameworkTheme?: FrameworkTheme
  /** Callback when survey is completed */
  onComplete?: (data: Record<string, unknown>) => void
  /** Callback when any value changes (for auto-save) */
  onValueChanged?: (name: string, value: unknown, data: Record<string, unknown>) => void
  /** Initial data to populate the survey */
  initialData?: Record<string, unknown>
  /** Storage key for auto-save to localStorage (optional) */
  autoSaveKey?: string
  /** Whether to show progress bar */
  showProgressBar?: boolean
  /** Custom CSS class for the container */
  className?: string
}

/**
 * SurveyWrapper - Themed survey component for alignment-comparator.
 *
 * Wraps SurveyJS with:
 * - Custom theme matching our design system
 * - Framework colour overrides (HSI blue, Constitutional amber, Hybrid violet)
 * - Auto-save to localStorage
 * - Accessibility-first configuration
 *
 * @example
 * ```tsx
 * <SurveyWrapper
 *   surveyJson={demographicsSchema}
 *   frameworkTheme="hsi"
 *   onComplete={(data) => saveToSupabase(data)}
 *   autoSaveKey="demographics-draft"
 * />
 * ```
 */
export function SurveyWrapper({
  surveyJson,
  frameworkTheme = 'neutral',
  onComplete,
  onValueChanged,
  initialData,
  autoSaveKey,
  showProgressBar = true,
  className,
}: SurveyWrapperProps) {
  const [survey] = useState(() => {
    const surveyModel = new Model(surveyJson)

    // Build theme with framework overrides
    const theme: ITheme = {
      ...alignmentTheme,
      cssVariables: {
        ...alignmentTheme.cssVariables,
        ...(frameworkTheme !== 'neutral' ? frameworkThemes[frameworkTheme] : {}),
      },
    }
    surveyModel.applyTheme(theme)

    // Configure accessibility
    surveyModel.focusFirstQuestionAutomatic = true
    surveyModel.showProgressBar = showProgressBar ? 'top' : 'off'
    surveyModel.progressBarType = 'questions'

    // Restore from localStorage if auto-save enabled
    if (autoSaveKey && typeof window !== 'undefined') {
      const savedData = localStorage.getItem(autoSaveKey)
      if (savedData) {
        try {
          surveyModel.data = JSON.parse(savedData)
        } catch {
          // Invalid saved data, ignore
        }
      }
    }

    // Apply initial data (overrides localStorage)
    if (initialData) {
      surveyModel.data = { ...surveyModel.data, ...initialData }
    }

    return surveyModel
  })

  // Handle survey completion
  const handleComplete = useCallback(
    (sender: Model) => {
      const results = sender.data

      // Clear auto-save on completion
      if (autoSaveKey && typeof window !== 'undefined') {
        localStorage.removeItem(autoSaveKey)
      }

      onComplete?.(results)
    },
    [autoSaveKey, onComplete]
  )

  // Handle value changes for auto-save
  const handleValueChanged = useCallback(
    (sender: Model, options: { name: string; value: unknown }) => {
      // Auto-save to localStorage
      if (autoSaveKey && typeof window !== 'undefined') {
        localStorage.setItem(autoSaveKey, JSON.stringify(sender.data))
      }

      onValueChanged?.(options.name, options.value, sender.data)
    },
    [autoSaveKey, onValueChanged]
  )

  // Register event handlers
  useEffect(() => {
    survey.onComplete.add(handleComplete)
    survey.onValueChanged.add(handleValueChanged)

    return () => {
      survey.onComplete.remove(handleComplete)
      survey.onValueChanged.remove(handleValueChanged)
    }
  }, [survey, handleComplete, handleValueChanged])

  return (
    <div className={className}>
      <Survey model={survey} />
    </div>
  )
}
