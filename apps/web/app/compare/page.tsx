'use client'

import * as React from 'react'
import Link from 'next/link'
import { ContentWarning, useContentWarningAcknowledged } from '@/components/content-warning'
import { ScenarioInput } from '@/components/scenario-input'
import { ComparisonView, type FrameworkResponseState } from '@/components/comparison-view'
import { ReflectionPrompt } from '@/components/reflection-prompt'
import { parseFrameworkResponse } from '@/lib/utils'
import type { FrameworkId } from '@/lib/types'
import { Button } from '@/components/ui/button'

/**
 * Participant comparison interface page.
 *
 * This page provides the interactive comparison experience for participants.
 * It orchestrates the comparison of three AI alignment frameworks:
 * 1. Microsoft HSI (Humanist Superintelligence)
 * 2. Anthropic Constitutional AI
 * 3. Hybrid approach combining both frameworks
 *
 * Features:
 * - Content warning modal with consent flow
 * - Scenario input via presets or custom text
 * - Parallel streaming responses from three frameworks
 * - Per-framework error handling and retry
 * - Buddhist ethics reflection prompts
 *
 * @module app/compare/page
 */

/**
 * Stream message types from the /api/compare endpoint.
 */
interface StreamMessage {
  framework: FrameworkId
  type: 'delta' | 'done' | 'error'
  content: string
  promptVersion?: string
  tokenCount?: number
  error?: string
}

/**
 * Initial state for framework responses.
 */
const initialResponseState: FrameworkResponseState = {
  content: undefined,
  isStreaming: false,
  reasoningTrace: undefined,
  error: undefined,
  promptVersion: undefined,
  tokenCount: undefined,
}

/**
 * ComparePage component - Participant comparison interface.
 *
 * Responsibilities:
 * - Display content warning modal on first visit
 * - Provide scenario input (custom text or presets)
 * - Trigger parallel API calls to the comparison endpoint
 * - Display streaming responses in three-column comparison view
 * - Show reflection prompts after responses complete
 *
 * @returns The comparison interface for participants
 */
export default function ComparePage() {
  // Content warning acknowledgement state (persisted in localStorage)
  const hasAcknowledged = useContentWarningAcknowledged()
  const [showWarning, setShowWarning] = React.useState(!hasAcknowledged)

  // Scenario state
  const [currentScenario, setCurrentScenario] = React.useState('')
  const [currentScenarioId, setCurrentScenarioId] = React.useState<string | undefined>()

  // Framework response states
  const [hsiResponse, setHsiResponse] = React.useState<FrameworkResponseState>(initialResponseState)
  const [constitutionalResponse, setConstitutionalResponse] = React.useState<FrameworkResponseState>(initialResponseState)
  const [hybridResponse, setHybridResponse] = React.useState<FrameworkResponseState>(initialResponseState)

  // Global loading state
  const [isComparing, setIsComparing] = React.useState(false)

  // Comparison count for results navigation
  const [comparisonCount, setComparisonCount] = React.useState(0)

  // Update show warning when acknowledgement changes
  React.useEffect(() => {
    setShowWarning(!hasAcknowledged)
  }, [hasAcknowledged])

  /**
   * Get the state setter for a given framework.
   */
  const getResponseSetter = React.useCallback((framework: FrameworkId) => {
    switch (framework) {
      case 'hsi':
        return setHsiResponse
      case 'constitutional':
        return setConstitutionalResponse
      case 'hybrid':
        return setHybridResponse
    }
  }, [])

  /**
   * Process a stream message and update the appropriate framework state.
   */
  const processStreamMessage = React.useCallback((message: StreamMessage) => {
    const setter = getResponseSetter(message.framework)

    switch (message.type) {
      case 'delta':
        setter((prev) => ({
          ...prev,
          content: (prev.content ?? '') + message.content,
          isStreaming: true,
        }))
        break

      case 'done':
        // Parse response to extract reasoning trace
        const { response, reasoning } = parseFrameworkResponse(message.content)
        setter({
          content: response,
          isStreaming: false,
          reasoningTrace: reasoning,
          error: undefined,
          promptVersion: message.promptVersion,
          tokenCount: message.tokenCount,
        })
        break

      case 'error':
        setter((prev) => ({
          ...prev,
          isStreaming: false,
          error: message.error ?? 'An unknown error occurred',
        }))
        break
    }
  }, [getResponseSetter])

  /**
   * Handle scenario submission - initiates parallel framework comparison.
   */
  const handleSubmit = React.useCallback(async (scenario: string, scenarioId?: string) => {
    // Update scenario state
    setCurrentScenario(scenario)
    setCurrentScenarioId(scenarioId)
    setIsComparing(true)

    // Reset all framework states to streaming
    const streamingState: FrameworkResponseState = {
      content: '',
      isStreaming: true,
      reasoningTrace: undefined,
      error: undefined,
      promptVersion: undefined,
      tokenCount: undefined,
    }
    setHsiResponse(streamingState)
    setConstitutionalResponse(streamingState)
    setHybridResponse(streamingState)

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario,
          scenarioId,
          frameworks: ['hsi', 'constitutional', 'hybrid'] as FrameworkId[],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body received')
      }

      // Consume the multiplexed NDJSON stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true })

        // Process complete lines
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const message = JSON.parse(line) as StreamMessage
              processStreamMessage(message)
            } catch (parseError) {
              console.error('Failed to parse stream message:', line, parseError)
            }
          }
        }
      }

      // Process any remaining content in buffer
      if (buffer.trim()) {
        try {
          const message = JSON.parse(buffer) as StreamMessage
          processStreamMessage(message)
        } catch (parseError) {
          console.error('Failed to parse final buffer:', buffer, parseError)
        }
      }

      // Increment comparison count
      setComparisonCount((c) => c + 1)
    } catch (error) {
      // Set error state for all frameworks
      const errorMessage = error instanceof Error ? error.message : 'Failed to compare frameworks'
      setHsiResponse((prev) => ({ ...prev, isStreaming: false, error: prev.content ? undefined : errorMessage }))
      setConstitutionalResponse((prev) => ({ ...prev, isStreaming: false, error: prev.content ? undefined : errorMessage }))
      setHybridResponse((prev) => ({ ...prev, isStreaming: false, error: prev.content ? undefined : errorMessage }))
    } finally {
      setIsComparing(false)
    }
  }, [processStreamMessage])

  /**
   * Handle regeneration of a single framework's response.
   */
  const handleRegenerate = React.useCallback(async (framework: FrameworkId) => {
    if (!currentScenario) return

    const setter = getResponseSetter(framework)

    // Reset this framework to streaming state
    setter({
      content: '',
      isStreaming: true,
      reasoningTrace: undefined,
      error: undefined,
      promptVersion: undefined,
      tokenCount: undefined,
    })

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario: currentScenario,
          scenarioId: currentScenarioId,
          frameworks: [framework],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body received')
      }

      // Consume stream for single framework
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.trim()) {
            try {
              const message = JSON.parse(line) as StreamMessage
              processStreamMessage(message)
            } catch (parseError) {
              console.error('Failed to parse stream message:', parseError)
            }
          }
        }
      }

      if (buffer.trim()) {
        try {
          const message = JSON.parse(buffer) as StreamMessage
          processStreamMessage(message)
        } catch (parseError) {
          console.error('Failed to parse final buffer:', parseError)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate response'
      setter((prev) => ({
        ...prev,
        isStreaming: false,
        error: errorMessage,
      }))
    }
  }, [currentScenario, currentScenarioId, getResponseSetter, processStreamMessage])

  /**
   * Handle reflection submission (for future analytics).
   */
  const handleReflectionSubmit = React.useCallback((_reflection: string) => {
    // Store in localStorage for results page
    const reflections = JSON.parse(localStorage.getItem('alignment-reflections') ?? '[]')
    reflections.push({
      timestamp: new Date().toISOString(),
      scenario: currentScenario,
      reflection: _reflection,
    })
    localStorage.setItem('alignment-reflections', JSON.stringify(reflections))
  }, [currentScenario])

  // Check if all responses are complete (for showing reflection prompt)
  const responsesComplete =
    !hsiResponse.isStreaming &&
    !constitutionalResponse.isStreaming &&
    !hybridResponse.isStreaming &&
    (hsiResponse.content || hsiResponse.error) &&
    (constitutionalResponse.content || constitutionalResponse.error) &&
    (hybridResponse.content || hybridResponse.error)

  // Show content warning if not acknowledged
  if (showWarning) {
    return <ContentWarning onAcknowledge={() => setShowWarning(false)} />
  }

  return (
    <main id="main-content" className="min-h-screen bg-background" tabIndex={-1}>
      <div className="container mx-auto px-4 py-8">
        {/* Header with navigation */}
        <header className="mb-8">
          <nav className="mb-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              &larr; Back to home
            </Link>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Framework Comparison
          </h1>
          <p className="mt-2 text-muted-foreground">
            Compare how different AI alignment frameworks respond to mental health scenarios
          </p>
        </header>

        {/* Scenario Input */}
        <section className="mb-8">
          <ScenarioInput
            onSubmit={handleSubmit}
            isLoading={isComparing}
            initialValue={currentScenario}
          />
        </section>

        {/* Comparison View - Only show after submission */}
        {currentScenario && (
          <section className="mb-8">
            <ComparisonView
              scenario={currentScenario}
              scenarioId={currentScenarioId}
              hsiResponse={hsiResponse}
              constitutionalResponse={constitutionalResponse}
              hybridResponse={hybridResponse}
              onRegenerate={handleRegenerate}
            />
          </section>
        )}

        {/* Reflection Prompt - Only show after all responses complete */}
        {currentScenario && responsesComplete && (
          <section className="mb-8">
            <ReflectionPrompt
              scenario={currentScenario}
              responsesComplete={!!responsesComplete}
              onReflectionSubmit={handleReflectionSubmit}
            />
          </section>
        )}

        {/* Results navigation - show after at least one complete comparison */}
        {comparisonCount > 0 && responsesComplete && (
          <section className="mb-8 text-center">
            <div className="rounded-lg border bg-muted/30 p-6">
              <p className="mb-4 text-sm text-muted-foreground">
                You&apos;ve completed {comparisonCount} comparison{comparisonCount > 1 ? 's' : ''}
              </p>
              <Button asChild>
                <Link href="/results">View Your Results</Link>
              </Button>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          Academic project for RELI E-1730: Mindfulness, AI, and Ethics
          <br />
          Harvard Extension School
        </p>
      </footer>
    </main>
  )
}
