'use client'

import * as React from 'react'
import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  MessagePrimitive,
  ContentPartPrimitive,
  useLocalRuntime,
  type ChatModelAdapter,
} from '@assistant-ui/react'
import { Badge } from '@/components/ui/badge'
import { ReasoningTrace } from '@/components/reasoning-trace'
import type { FrameworkId, FrameworkResponse as FrameworkResponseType } from '@/lib/types'
import { FRAMEWORK_PROMPTS } from '@/lib/prompts'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Props for the FrameworkResponse component.
 */
export interface FrameworkResponseProps {
  /** Which alignment framework this response represents */
  framework: FrameworkId
  /** The streaming or complete response content */
  content?: string
  /** Whether the response is currently streaming */
  isStreaming?: boolean
  /** Reasoning trace from the model */
  reasoningTrace?: string
  /** Error message if the API call failed */
  error?: string
  /** Prompt version used for this response */
  promptVersion?: string
  /** Token count for the response */
  tokenCount?: number
  /** Callback to regenerate this framework's response */
  onRegenerate?: () => void
}

/**
 * FrameworkResponse component - Displays a single AI framework's response.
 *
 * This component shows the response from one of the three alignment frameworks,
 * with visual styling that distinguishes it from the others. It supports:
 * - Rich text display using assistant-ui primitives
 * - Framework identification with colour coding
 * - Collapsible reasoning trace
 * - Copy to clipboard functionality
 * - Error state handling
 * - Streaming indicator
 *
 * @param framework - The framework type (hsi, constitutional, hybrid)
 * @param content - Response text content
 * @param isStreaming - Loading/streaming state
 * @param reasoningTrace - Reasoning trace string
 * @param error - Error message if failed
 * @param promptVersion - Version of the prompt used
 * @param tokenCount - Number of tokens in response
 * @param onRegenerate - Callback to regenerate response
 *
 * @returns FrameworkResponse component with streaming support
 *
 * @example
 * ```tsx
 * <FrameworkResponse
 *   framework="constitutional"
 *   content={responseText}
 *   isStreaming={isLoading}
 *   reasoningTrace={trace}
 * />
 * ```
 */
export function FrameworkResponse({
  framework,
  content,
  isStreaming = false,
  reasoningTrace,
  error,
  promptVersion,
  tokenCount,
  onRegenerate,
}: FrameworkResponseProps) {
  const config = FRAMEWORK_PROMPTS[framework]
  const [copied, setCopied] = React.useState(false)

  const handleCopy = React.useCallback(async () => {
    if (content) {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [content])

  return (
    <div className="flex h-full flex-col">
      {/* Header with framework identification */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={framework} className="font-medium">
            {config.shortName}
          </Badge>
          <span className="text-sm text-muted-foreground">{config.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {isStreaming && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
              streaming
            </span>
          )}
          {promptVersion && (
            <span className="text-xs text-muted-foreground">v{promptVersion}</span>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          {onRegenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Response content */}
      {!error && (
        <div
          className={`flex-1 rounded-lg border p-4 transition-colors duration-150 ease-in-out ${config.colour.border} ${config.colour.primary}`}
        >
          {content ? (
            <div className="space-y-3">
              {/* Main response text */}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className={`whitespace-pre-wrap ${config.colour.secondary}`}>
                  {content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {tokenCount && <span>{tokenCount} tokens</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 px-2"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  {onRegenerate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRegenerate}
                      disabled={isStreaming}
                      className="h-7 px-2"
                    >
                      <RefreshCw className={`h-3 w-3 ${isStreaming ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              {isStreaming ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Generating {config.shortName} response...
                  </span>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Submit a scenario to see the {config.shortName} response
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reasoning trace */}
      {reasoningTrace && !error && (
        <div className="mt-3">
          <ReasoningTrace framework={framework} trace={reasoningTrace} />
        </div>
      )}
    </div>
  )
}

/**
 * Streaming FrameworkResponse component using assistant-ui runtime.
 *
 * This variant uses the assistant-ui runtime for full streaming support
 * with proper message threading and content parts.
 */
export interface StreamingFrameworkResponseProps {
  /** Which alignment framework this response represents */
  framework: FrameworkId
  /** Chat model adapter for streaming */
  adapter: ChatModelAdapter
}

export function StreamingFrameworkResponse({
  framework,
  adapter,
}: StreamingFrameworkResponseProps) {
  const runtime = useLocalRuntime(adapter)
  const config = FRAMEWORK_PROMPTS[framework]

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full flex-col">
        <div className="mb-3 flex items-center gap-2">
          <Badge variant={framework} className="font-medium">
            {config.shortName}
          </Badge>
          <span className="text-sm text-muted-foreground">{config.name}</span>
        </div>

        <div
          className={`flex-1 rounded-lg border p-4 ${config.colour.border} ${config.colour.primary}`}
        >
          <ThreadPrimitive.Root>
            <ThreadPrimitive.Viewport className="flex flex-col gap-4">
              <ThreadPrimitive.Messages
                components={{
                  AssistantMessage: () => (
                    <MessagePrimitive.Root>
                      <MessagePrimitive.Content
                        components={{
                          Text: ({ text }) => (
                            <p className={`whitespace-pre-wrap text-sm ${config.colour.secondary}`}>
                              {text}
                            </p>
                          ),
                        }}
                      />
                    </MessagePrimitive.Root>
                  ),
                }}
              />
            </ThreadPrimitive.Viewport>
          </ThreadPrimitive.Root>
        </div>
      </div>
    </AssistantRuntimeProvider>
  )
}
