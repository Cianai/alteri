'use client'

import * as React from 'react'
import { FrameworkResponse } from '@/components/framework-response'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { FrameworkId } from '@/lib/types'
import { Maximize2, Minimize2, Download } from 'lucide-react'

/**
 * Response state for a single framework.
 */
export interface FrameworkResponseState {
  content?: string
  isStreaming: boolean
  reasoningTrace?: string
  error?: string
  promptVersion?: string
  tokenCount?: number
}

/**
 * Props for the ComparisonView component.
 */
export interface ComparisonViewProps {
  /** The scenario being compared */
  scenario: string
  /** Scenario ID if from presets */
  scenarioId?: string
  /** HSI framework response */
  hsiResponse?: FrameworkResponseState
  /** Constitutional AI framework response */
  constitutionalResponse?: FrameworkResponseState
  /** Hybrid framework response */
  hybridResponse?: FrameworkResponseState
  /** Callback to regenerate a specific framework's response */
  onRegenerate?: (framework: FrameworkId) => void
}

/**
 * ComparisonView component - Three-column layout for framework comparison.
 *
 * This component orchestrates the side-by-side display of responses from
 * all three AI alignment frameworks. It handles:
 * - Responsive layout (stacked on mobile, columns on desktop)
 * - Synchronized streaming state across frameworks
 * - Visual differentiation of each framework
 * - Focus mode to expand single framework
 * - Accessibility for screen readers
 *
 * Layout:
 * - Desktop: Three equal columns (grid-cols-3)
 * - Tablet: Two columns then one (grid-cols-2)
 * - Mobile: Single column, stacked (grid-cols-1)
 *
 * @param scenario - The input scenario being compared
 * @param scenarioId - Optional preset scenario ID
 * @param hsiResponse - Response from HSI framework
 * @param constitutionalResponse - Response from Constitutional AI
 * @param hybridResponse - Response from Hybrid approach
 * @param onRegenerate - Callback to regenerate a framework response
 *
 * @returns Three-column comparison layout with responsive grid
 *
 * @example
 * ```tsx
 * <ComparisonView
 *   scenario={currentScenario}
 *   hsiResponse={responses.hsi}
 *   constitutionalResponse={responses.constitutional}
 *   hybridResponse={responses.hybrid}
 *   onRegenerate={(fw) => regenerate(fw)}
 * />
 * ```
 */
export function ComparisonView({
  scenario,
  scenarioId,
  hsiResponse,
  constitutionalResponse,
  hybridResponse,
  onRegenerate,
}: ComparisonViewProps) {
  const [focusedFramework, setFocusedFramework] = React.useState<FrameworkId | null>(null)

  // Check if any framework is streaming
  const isAnyStreaming =
    hsiResponse?.isStreaming ||
    constitutionalResponse?.isStreaming ||
    hybridResponse?.isStreaming

  // Check if all responses are complete
  const allComplete =
    hsiResponse?.content &&
    constitutionalResponse?.content &&
    hybridResponse?.content &&
    !isAnyStreaming

  const handleFocus = (framework: FrameworkId) => {
    setFocusedFramework(focusedFramework === framework ? null : framework)
  }

  // Render a framework column
  const renderFrameworkColumn = (
    framework: FrameworkId,
    response?: FrameworkResponseState
  ) => {
    const isFocused = focusedFramework === framework
    const isHidden = focusedFramework !== null && focusedFramework !== framework

    if (isHidden) {
      return null
    }

    return (
      <Card
        className={`transition-all duration-150 ease-in-out ${
          isFocused ? 'col-span-full' : ''
        }`}
      >
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFocus(framework)}
              className="h-7 px-2"
              aria-label={isFocused ? 'Exit focus mode' : 'Focus on this response'}
            >
              {isFocused ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
          </div>
          <FrameworkResponse
            framework={framework}
            content={response?.content}
            isStreaming={response?.isStreaming ?? false}
            reasoningTrace={response?.reasoningTrace}
            error={response?.error}
            promptVersion={response?.promptVersion}
            tokenCount={response?.tokenCount}
            onRegenerate={onRegenerate ? () => onRegenerate(framework) : undefined}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Scenario context banner */}
      {scenario && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Scenario</p>
                {scenarioId && (
                  <Badge variant="outline" className="text-xs">
                    {scenarioId}
                  </Badge>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {scenario}
              </p>
            </div>
            {allComplete && (
              <Button variant="outline" size="sm" className="shrink-0">
                <Download className="mr-2 h-3 w-3" />
                Export
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Loading indicator when streaming */}
      {isAnyStreaming && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
          Generating responses across frameworks...
        </div>
      )}

      {/* Three-column responsive grid */}
      <div
        className={`grid gap-4 ${
          focusedFramework
            ? 'grid-cols-1'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}
        role="region"
        aria-label="Framework comparison responses"
      >
        {renderFrameworkColumn('hsi', hsiResponse)}
        {renderFrameworkColumn('constitutional', constitutionalResponse)}
        {renderFrameworkColumn('hybrid', hybridResponse)}
      </div>

      {/* Completion summary */}
      {allComplete && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-center text-sm text-green-700 dark:text-green-300">
            All three framework responses generated. Review and compare the approaches above.
          </p>
        </div>
      )}
    </div>
  )
}
