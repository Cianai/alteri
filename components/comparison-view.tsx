'use client'

import * as React from 'react'
// TODO: Uncomment imports when components are available
// import { FrameworkResponse } from '@/components/framework-response'
// import { Card } from '@/components/ui/card'
// import type { ComparisonResult, FrameworkType } from '@/lib/types'

/**
 * Props for the ComparisonView component.
 */
export interface ComparisonViewProps {
  /** The scenario being compared */
  scenario: string
  /** HSI framework response */
  hsiResponse?: {
    content: string
    isStreaming: boolean
    reasoningTrace?: string[]
    error?: string
  }
  /** Constitutional AI framework response */
  constitutionalResponse?: {
    content: string
    isStreaming: boolean
    reasoningTrace?: string[]
    error?: string
  }
  /** Hybrid framework response */
  hybridResponse?: {
    content: string
    isStreaming: boolean
    reasoningTrace?: string[]
    error?: string
  }
}

/**
 * ComparisonView component - Three-column layout for framework comparison.
 *
 * This component orchestrates the side-by-side display of responses from
 * all three AI alignment frameworks. It handles:
 * - Responsive layout (stacked on mobile, columns on desktop)
 * - Synchronized streaming state across frameworks
 * - Visual differentiation of each framework
 * - Accessibility for screen readers
 *
 * Layout considerations:
 * - Desktop: Three equal columns
 * - Tablet: Two columns (HSI + Constitutional), Hybrid below
 * - Mobile: Single column, stacked
 *
 * TODO: Implement the following features:
 * - [ ] Add scroll synchronisation option across columns
 * - [ ] Implement diff highlighting between responses
 * - [ ] Add "focus mode" to expand single framework
 * - [ ] Export comparison as PDF/image
 * - [ ] Add word count and response length comparison
 * - [ ] Implement keyboard navigation between columns
 * - [ ] Add column reordering via drag-and-drop
 * - [ ] Support theme-aware framework colours
 *
 * @param scenario - The input scenario being compared
 * @param hsiResponse - Response from HSI framework
 * @param constitutionalResponse - Response from Constitutional AI
 * @param hybridResponse - Response from Hybrid approach
 *
 * @returns Three-column comparison layout
 *
 * @example
 * ```tsx
 * <ComparisonView
 *   scenario={currentScenario}
 *   hsiResponse={responses.hsi}
 *   constitutionalResponse={responses.constitutional}
 *   hybridResponse={responses.hybrid}
 * />
 * ```
 */
export function ComparisonView({
  scenario,
  hsiResponse,
  constitutionalResponse,
  hybridResponse,
}: ComparisonViewProps) {
  // TODO: Implement scroll synchronisation
  // const [syncScroll, setSyncScroll] = React.useState(false)
  // const hsiRef = React.useRef<HTMLDivElement>(null)
  // const constitutionalRef = React.useRef<HTMLDivElement>(null)
  // const hybridRef = React.useRef<HTMLDivElement>(null)

  // TODO: Check if any framework is streaming
  const isAnyStreaming =
    hsiResponse?.isStreaming ||
    constitutionalResponse?.isStreaming ||
    hybridResponse?.isStreaming

  return (
    <div className="space-y-4">
      {/* Scenario context banner */}
      {scenario && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm font-medium">Scenario:</p>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
            {scenario}
          </p>
        </div>
      )}

      {/* TODO: Add comparison controls */}
      {/* <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={syncScroll}
            onCheckedChange={setSyncScroll}
            id="sync-scroll"
          />
          <Label htmlFor="sync-scroll">Synchronise scroll</Label>
        </div>
        <Button variant="outline" size="sm">
          Export comparison
        </Button>
      </div> */}

      {/* Three-column grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* HSI Column */}
        <div className="rounded-lg border bg-card p-4">
          {/* TODO: Replace with FrameworkResponse component */}
          {/* <FrameworkResponse
            framework="hsi"
            content={hsiResponse?.content}
            isStreaming={hsiResponse?.isStreaming}
            reasoningTrace={hsiResponse?.reasoningTrace}
            error={hsiResponse?.error}
          /> */}
          <div className="flex h-full flex-col">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-hsi" />
              <h3 className="font-semibold">Microsoft HSI</h3>
              {hsiResponse?.isStreaming && (
                <span className="animate-pulse text-xs text-muted-foreground">
                  streaming...
                </span>
              )}
            </div>
            <div className="flex-1 rounded border border-dashed p-4 text-sm text-muted-foreground">
              {hsiResponse?.content || 'TODO: Implement HSI response display'}
            </div>
          </div>
        </div>

        {/* Constitutional AI Column */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex h-full flex-col">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-constitutional" />
              <h3 className="font-semibold">Constitutional AI</h3>
              {constitutionalResponse?.isStreaming && (
                <span className="animate-pulse text-xs text-muted-foreground">
                  streaming...
                </span>
              )}
            </div>
            <div className="flex-1 rounded border border-dashed p-4 text-sm text-muted-foreground">
              {constitutionalResponse?.content || 'TODO: Implement Constitutional AI response display'}
            </div>
          </div>
        </div>

        {/* Hybrid Column */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex h-full flex-col">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-hybrid" />
              <h3 className="font-semibold">Hybrid Approach</h3>
              {hybridResponse?.isStreaming && (
                <span className="animate-pulse text-xs text-muted-foreground">
                  streaming...
                </span>
              )}
            </div>
            <div className="flex-1 rounded border border-dashed p-4 text-sm text-muted-foreground">
              {hybridResponse?.content || 'TODO: Implement Hybrid response display'}
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isAnyStreaming && (
        <p className="text-center text-sm text-muted-foreground">
          Generating responses across all frameworks...
        </p>
      )}
    </div>
  )
}
