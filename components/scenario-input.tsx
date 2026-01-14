'use client'

import * as React from 'react'
// TODO: Uncomment imports when components are fully implemented
// import { Button } from '@/components/ui/button'
// import { Textarea } from '@/components/ui/textarea'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { PRESET_SCENARIOS } from '@/lib/scenarios'
// import type { Scenario, ScenarioCategory } from '@/lib/types'

/**
 * Props for the ScenarioInput component.
 */
export interface ScenarioInputProps {
  /** Callback fired when user submits a scenario for comparison */
  onSubmit: (scenario: string) => void
  /** Whether comparison is currently in progress */
  isLoading?: boolean
  /** Initial scenario text (for editing/resubmission) */
  initialValue?: string
}

/**
 * ScenarioInput component - Text input with preset scenario selector.
 *
 * This component provides two ways to input mental health scenarios:
 * 1. Free-text input for custom scenarios
 * 2. Preset scenario selector with categorised examples
 *
 * Categories of preset scenarios:
 * - Crisis: Immediate safety concerns (suicidal ideation, self-harm)
 * - Ambiguous: Unclear severity or intent
 * - Boundary: Testing AI's limits and refusal behaviour
 * - Extended: Multi-turn or evolving scenarios
 *
 * TODO: Implement the following features:
 * - [ ] Preset scenario dropdown/tabs by category
 * - [ ] Character count with suggested length guidance
 * - [ ] Clear/reset button
 * - [ ] Save custom scenarios to localStorage
 * - [ ] Scenario sharing via URL parameters
 * - [ ] Input validation for minimum scenario length
 * - [ ] Accessibility: proper labels, keyboard navigation
 *
 * @param onSubmit - Callback when scenario is submitted
 * @param isLoading - Disables input during API calls
 * @param initialValue - Pre-populate the textarea
 *
 * @returns ScenarioInput component with text area and preset selector
 *
 * @example
 * ```tsx
 * <ScenarioInput
 *   onSubmit={(scenario) => handleCompare(scenario)}
 *   isLoading={isComparing}
 * />
 * ```
 */
export function ScenarioInput({
  onSubmit,
  isLoading = false,
  initialValue = '',
}: ScenarioInputProps) {
  // TODO: Implement state management
  // const [scenario, setScenario] = React.useState(initialValue)
  // const [selectedCategory, setSelectedCategory] = React.useState<ScenarioCategory | null>(null)

  // TODO: Implement submission handler
  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   if (scenario.trim().length > 0) {
  //     onSubmit(scenario)
  //   }
  // }

  // TODO: Implement preset selection
  // const handlePresetSelect = (preset: Scenario) => {
  //   setScenario(preset.content)
  // }

  return (
    <div className="space-y-4">
      {/* TODO: Implement category tabs */}
      {/* <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="crisis">Crisis</TabsTrigger>
          <TabsTrigger value="ambiguous">Ambiguous</TabsTrigger>
          <TabsTrigger value="boundary">Boundary</TabsTrigger>
          <TabsTrigger value="extended">Extended</TabsTrigger>
        </TabsList>
      </Tabs> */}

      {/* TODO: Implement preset scenario cards */}
      {/* {selectedCategory && (
        <div className="grid gap-2 md:grid-cols-2">
          {PRESET_SCENARIOS[selectedCategory].map((preset) => (
            <Card
              key={preset.id}
              className="cursor-pointer hover:border-primary"
              onClick={() => handlePresetSelect(preset)}
            >
              <CardHeader className="p-3">
                <CardTitle className="text-sm">{preset.title}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )} */}

      {/* TODO: Implement textarea form */}
      {/* <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          placeholder="Enter a mental health scenario to compare across frameworks..."
          className="min-h-[120px]"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {scenario.length} characters
          </span>
          <Button type="submit" disabled={isLoading || scenario.trim().length === 0}>
            {isLoading ? 'Comparing...' : 'Compare Frameworks'}
          </Button>
        </div>
      </form> */}

      {/* Placeholder until implementation */}
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p className="text-sm">
          TODO: Implement ScenarioInput component
          <br />
          <span className="text-xs">
            Props received: onSubmit={String(typeof onSubmit)}, isLoading={String(isLoading)}, initialValue=&quot;{initialValue}&quot;
          </span>
        </p>
      </div>
    </div>
  )
}
