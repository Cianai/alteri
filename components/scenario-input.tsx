'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getScenariosByCategory, getAllScenarios } from '@/lib/scenarios'
import type { Scenario, ScenarioCategory } from '@/lib/types'
import { AlertTriangle, Send } from 'lucide-react'

/**
 * Props for the ScenarioInput component.
 */
export interface ScenarioInputProps {
  /** Callback fired when user submits a scenario for comparison */
  onSubmit: (scenario: string, scenarioId?: string) => void
  /** Whether comparison is currently in progress */
  isLoading?: boolean
  /** Initial scenario text (for editing/resubmission) */
  initialValue?: string
}

/**
 * Category metadata for display.
 */
const CATEGORY_INFO: Record<ScenarioCategory, { label: string; description: string }> = {
  'crisis-explicit': {
    label: 'Crisis (Explicit)',
    description: 'Direct statements of suicidal ideation or self-harm',
  },
  'crisis-indirect': {
    label: 'Crisis (Indirect)',
    description: 'Implied crisis without explicit statements',
  },
  ambiguous: {
    label: 'Ambiguous',
    description: 'Unclear severity or intent requiring interpretation',
  },
  boundary: {
    label: 'Boundary',
    description: 'Testing AI limits and refusal behaviour',
  },
  extended: {
    label: 'Extended',
    description: 'Multi-turn or evolving scenarios',
  },
  information: {
    label: 'Information',
    description: 'Requests for mental health information',
  },
}

/**
 * ScenarioInput component - Text input with preset scenario selector.
 *
 * This component provides two ways to input mental health scenarios:
 * 1. Preset scenario selector with categorised examples
 * 2. Free-text input for custom scenarios
 *
 * Features:
 * - Tabbed interface (Presets/Custom)
 * - Category-organised preset scenarios
 * - Content warning badges
 * - Character count display
 * - Loading state handling
 *
 * @param onSubmit - Callback when scenario is submitted
 * @param isLoading - Disables input during API calls
 * @param initialValue - Pre-populate the textarea
 *
 * @returns ScenarioInput component with tabs, preset grid, and custom input
 *
 * @example
 * ```tsx
 * <ScenarioInput
 *   onSubmit={(scenario, id) => handleCompare(scenario, id)}
 *   isLoading={isComparing}
 * />
 * ```
 */
export function ScenarioInput({
  onSubmit,
  isLoading = false,
  initialValue = '',
}: ScenarioInputProps) {
  const [scenario, setScenario] = React.useState(initialValue)
  const [selectedScenario, setSelectedScenario] = React.useState<Scenario | null>(null)
  const [activeTab, setActiveTab] = React.useState<'presets' | 'custom'>('presets')
  const [selectedCategory, setSelectedCategory] = React.useState<ScenarioCategory>('crisis-explicit')

  // Get scenarios for current category
  const categoryScenarios = getScenariosByCategory(selectedCategory)

  const handlePresetSelect = (preset: Scenario) => {
    setSelectedScenario(preset)
    setScenario(preset.content)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (scenario.trim().length > 0) {
      onSubmit(scenario, selectedScenario?.id)
    }
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (scenario.trim().length > 0) {
      onSubmit(scenario)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'presets' | 'custom')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets">Preset Scenarios</TabsTrigger>
          <TabsTrigger value="custom">Custom Input</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-4">
          {/* Category selector */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_INFO) as ScenarioCategory[]).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="transition-colors duration-150 ease-in-out"
              >
                {CATEGORY_INFO[category].label}
              </Button>
            ))}
          </div>

          {/* Category description */}
          <p className="text-sm text-muted-foreground">
            {CATEGORY_INFO[selectedCategory].description}
          </p>

          {/* Scenario grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {categoryScenarios.map((preset) => (
              <Card
                key={preset.id}
                className={`cursor-pointer transition-all duration-150 ease-in-out hover:border-primary hover:shadow-sm ${
                  selectedScenario?.id === preset.id ? 'border-primary ring-1 ring-primary' : ''
                }`}
                onClick={() => handlePresetSelect(preset)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-medium">{preset.title}</CardTitle>
                    <Badge variant={preset.category} className="shrink-0 text-xs">
                      {CATEGORY_INFO[preset.category].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <CardDescription className="line-clamp-2 text-xs">
                    {preset.description}
                  </CardDescription>
                  {preset.contentWarning && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{preset.contentWarning}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected scenario preview and submit */}
          {selectedScenario && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium">{selectedScenario.title}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {selectedScenario.content}
                </p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    'Comparing...'
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Compare Frameworks
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="custom-scenario" className="text-sm font-medium">
                Enter your own scenario
              </label>
              <Textarea
                id="custom-scenario"
                value={scenario}
                onChange={(e) => {
                  setScenario(e.target.value)
                  setSelectedScenario(null) // Clear preset selection
                }}
                placeholder="Enter a mental health scenario to compare across frameworks..."
                className="min-h-[150px] transition-colors duration-150 ease-in-out focus:border-primary"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {scenario.length} characters
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setScenario('')
                    setSelectedScenario(null)
                  }}
                  disabled={isLoading || scenario.length === 0}
                >
                  Clear
                </Button>
                <Button type="submit" disabled={isLoading || scenario.trim().length === 0}>
                  {isLoading ? (
                    'Comparing...'
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Compare Frameworks
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Guidance note */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Custom scenarios should be realistic mental health interactions for academic
                comparison purposes. Avoid scenarios designed to elicit harmful content.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
