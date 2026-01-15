import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import type { NextRequest } from 'next/server'
import { FRAMEWORK_PROMPTS } from '@/lib/prompts'
import type { ComparisonRequest, FrameworkId } from '@/lib/types'
import { isFrameworkId } from '@/lib/types'

/**
 * API route for comparing AI responses across alignment frameworks.
 *
 * This endpoint accepts a mental health scenario and streams responses
 * from multiple alignment frameworks in parallel using a multiplexed
 * stream format.
 *
 * @module app/api/compare/route
 */

/**
 * Stream event types for the multiplexed response.
 */
type StreamEventType = 'delta' | 'done' | 'error'

/**
 * Structure of a stream event sent to the client.
 */
interface StreamEvent {
  framework: FrameworkId
  type: StreamEventType
  content: string
  promptVersion?: string
  error?: string
}

/**
 * Validates the comparison request body.
 *
 * @param body - The request body to validate
 * @returns Validated ComparisonRequest or error message
 */
function validateRequest(
  body: unknown
): { valid: true; data: ComparisonRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' }
  }

  const { scenario, frameworks, scenarioId } = body as Record<string, unknown>

  // Validate scenario
  if (typeof scenario !== 'string' || scenario.trim().length === 0) {
    return { valid: false, error: 'scenario must be a non-empty string' }
  }

  // Validate frameworks array
  if (!Array.isArray(frameworks) || frameworks.length === 0) {
    return {
      valid: false,
      error: 'frameworks must be a non-empty array of FrameworkId values',
    }
  }

  for (const f of frameworks) {
    if (typeof f !== 'string' || !isFrameworkId(f)) {
      return {
        valid: false,
        error: `Invalid framework: ${f}. Must be one of: hsi, constitutional, hybrid`,
      }
    }
  }

  return {
    valid: true,
    data: {
      scenario: scenario.trim(),
      frameworks: frameworks as FrameworkId[],
      scenarioId: typeof scenarioId === 'string' ? scenarioId : undefined,
    },
  }
}

/**
 * Creates a JSON line for the stream.
 */
function createStreamLine(event: StreamEvent): string {
  return JSON.stringify(event) + '\n'
}

/**
 * POST handler for the /api/compare endpoint.
 *
 * Accepts a scenario and array of frameworks, then streams AI responses
 * from all frameworks in parallel using a multiplexed format.
 *
 * Stream format (newline-delimited JSON):
 * {"framework":"hsi","type":"delta","content":"I hear"}
 * {"framework":"constitutional","type":"delta","content":"Thank you"}
 * {"framework":"hsi","type":"done","content":"<full response>","promptVersion":"0.1.0"}
 *
 * @param request - The incoming request with scenario and frameworks
 * @returns Streaming response with multiplexed framework responses
 */
export async function POST(request: NextRequest) {
  // TODO: Implement rate limiting
  const requestTimestamp = new Date().toISOString()

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error: 'Configuration error',
        message:
          'ANTHROPIC_API_KEY is not configured. Please add it to your .env.local file.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  // Parse and validate request
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const validation = validateRequest(body)
  if (!validation.valid) {
    return new Response(
      JSON.stringify({
        error: 'Validation error',
        message: validation.error,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const { scenario, frameworks } = validation.data

  // Create multiplexed stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      // Track accumulated responses for each framework
      const accumulatedResponses: Record<FrameworkId, string> = {
        hsi: '',
        constitutional: '',
        hybrid: '',
      }

      // Create stream promises for all frameworks
      const streamPromises = frameworks.map(async (frameworkId) => {
        const config = FRAMEWORK_PROMPTS[frameworkId]

        try {
          const result = streamText({
            model: anthropic('claude-sonnet-4-20250514'),
            system: config.systemPrompt,
            messages: [
              {
                role: 'user',
                content: scenario,
              },
            ],
          })

          // Process the stream
          for await (const chunk of result.textStream) {
            accumulatedResponses[frameworkId] += chunk

            const event: StreamEvent = {
              framework: frameworkId,
              type: 'delta',
              content: chunk,
            }
            controller.enqueue(encoder.encode(createStreamLine(event)))
          }

          // Send completion event with full response
          const doneEvent: StreamEvent = {
            framework: frameworkId,
            type: 'done',
            content: accumulatedResponses[frameworkId],
            promptVersion: config.version,
          }
          controller.enqueue(encoder.encode(createStreamLine(doneEvent)))
        } catch (error) {
          // Send error event for this framework without failing others
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
          const errorEvent: StreamEvent = {
            framework: frameworkId,
            type: 'error',
            content: '',
            error: errorMessage,
          }
          controller.enqueue(encoder.encode(createStreamLine(errorEvent)))

          console.error(
            `[${requestTimestamp}] Error streaming ${frameworkId}:`,
            errorMessage
          )
        }
      })

      // Wait for all streams to complete
      await Promise.all(streamPromises)

      // Close the stream
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

/**
 * Configuration for the API route.
 * Enables Edge runtime for optimal streaming performance.
 */
export const runtime = 'edge'
