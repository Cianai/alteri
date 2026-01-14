'use client'

import * as React from 'react'
// TODO: Uncomment imports when dependencies are available
// import { AssistantMessage, AssistantMessageContent } from '@assistant-ui/react'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { ReasoningTrace } from '@/components/reasoning-trace'
// import type { FrameworkType, FrameworkResponse as FrameworkResponseType } from '@/lib/types'

/**
 * Framework configuration for visual styling and metadata.
 */
const FRAMEWORK_CONFIG = {
  hsi: {
    name: 'Microsoft HSI',
    fullName: 'Humanist Superintelligence',
    color: 'bg-hsi',
    textColor: 'text-hsi',
    description: 'Domain containment, human-in-loop, interpretability',
  },
  constitutional: {
    name: 'Constitutional AI',
    fullName: 'Anthropic Constitutional AI',
    color: 'bg-constitutional',
    textColor: 'text-constitutional',
    description: 'Soul document hierarchy, brilliant friend model',
  },
  hybrid: {
    name: 'Hybrid',
    fullName: 'HSI + Constitutional Synthesis',
    color: 'bg-hybrid',
    textColor: 'text-hybrid',
    description: 'Combined containment and character training',
  },
} as const

/**
 * Props for the FrameworkResponse component.
 */
export interface FrameworkResponseProps {
  /** Which alignment framework this response represents */
  framework: 'hsi' | 'constitutional' | 'hybrid'
  /** The streaming or complete response content */
  content?: string
  /** Whether the response is currently streaming */
  isStreaming?: boolean
  /** Optional reasoning trace for transparency */
  reasoningTrace?: string[]
  /** Error message if the API call failed */
  error?: string
}

/**
 * FrameworkResponse component - Displays a single AI framework's response.
 *
 * This component shows the response from one of the three alignment frameworks,
 * with visual styling that distinguishes it from the others. It supports:
 * - Streaming text display using assistant-ui primitives
 * - Framework identification with colour coding
 * - Collapsible reasoning trace
 * - Error state handling
 *
 * TODO: Implement the following features:
 * - [ ] Integrate assistant-ui components for rich message display
 * - [ ] Add streaming indicator animation
 * - [ ] Implement copy-to-clipboard for responses
 * - [ ] Add response timing/token metrics
 * - [ ] Support markdown rendering in responses
 * - [ ] Add "regenerate" button for individual framework
 * - [ ] Implement response caching for comparison
 * - [ ] Add accessibility: announce streaming completion
 *
 * @param framework - The framework type (hsi, constitutional, hybrid)
 * @param content - Response text content
 * @param isStreaming - Loading/streaming state
 * @param reasoningTrace - Array of reasoning steps
 * @param error - Error message if failed
 *
 * @returns FrameworkResponse component with streaming support
 *
 * @example
 * ```tsx
 * <FrameworkResponse
 *   framework="constitutional"
 *   content={responseText}
 *   isStreaming={isLoading}
 *   reasoningTrace={traceSteps}
 * />
 * ```
 */
export function FrameworkResponse({
  framework,
  content,
  isStreaming = false,
  reasoningTrace,
  error,
}: FrameworkResponseProps) {
  const config = FRAMEWORK_CONFIG[framework]

  // TODO: Implement assistant-ui integration
  // Use AssistantRuntimeProvider and ThreadPrimitive for rich rendering

  return (
    <div className="flex h-full flex-col">
      {/* Header with framework identification */}
      <div className="mb-3 flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${config.color}`} />
        <h3 className="font-semibold">{config.name}</h3>
        {isStreaming && (
          <span className="text-xs text-muted-foreground animate-pulse">
            streaming...
          </span>
        )}
      </div>

      {/* TODO: Implement proper assistant-ui message display */}
      {/* <AssistantMessage>
        <AssistantMessageContent />
      </AssistantMessage> */}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Content placeholder */}
      {!error && (
        <div className="flex-1 rounded-lg border bg-muted/50 p-4">
          {content ? (
            <p className="whitespace-pre-wrap text-sm">{content}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              TODO: Implement response display with assistant-ui
              <br />
              <span className="text-xs">
                Framework: {config.fullName}
                <br />
                {config.description}
              </span>
            </p>
          )}
        </div>
      )}

      {/* TODO: Add ReasoningTrace component */}
      {/* {reasoningTrace && reasoningTrace.length > 0 && (
        <ReasoningTrace
          framework={framework}
          steps={reasoningTrace}
        />
      )} */}

      {/* Reasoning trace placeholder */}
      {reasoningTrace && reasoningTrace.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground">
            TODO: Display {reasoningTrace.length} reasoning steps
          </p>
        </div>
      )}
    </div>
  )
}
