import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import type { NextRequest } from 'next/server'

/**
 * API route for comparing AI responses across alignment frameworks.
 *
 * This endpoint accepts a mental health scenario and returns streaming
 * responses from three different AI alignment frameworks:
 * 1. HSI (Humanist Superintelligence) - Microsoft's approach
 * 2. Constitutional AI - Anthropic's approach
 * 3. Hybrid - Combined approach
 *
 * @module app/api/compare/route
 */

// TODO: Import system prompts once implemented
// import { HSI_PROMPT, CONSTITUTIONAL_PROMPT, HYBRID_PROMPT } from '@/lib/prompts'
// import type { CompareRequest, FrameworkType } from '@/lib/types'

/**
 * Request body interface for the compare endpoint.
 */
interface CompareRequestBody {
  /** The mental health scenario to analyse */
  scenario: string
  /** Which framework to use for this request */
  framework: 'hsi' | 'constitutional' | 'hybrid'
}

/**
 * POST handler for the /api/compare endpoint.
 *
 * Accepts a scenario and framework type, then streams the AI response
 * using the appropriate system prompt.
 *
 * Implementation details:
 * - Uses Vercel AI SDK's streamText for efficient streaming
 * - Applies framework-specific system prompts
 * - Returns a streaming response compatible with assistant-ui
 *
 * TODO: Implement the following:
 * - [ ] Load system prompts from @/lib/prompts
 * - [ ] Add request validation with Zod
 * - [ ] Implement rate limiting
 * - [ ] Add error handling for API failures
 * - [ ] Track reasoning trace for transparency
 * - [ ] Add logging for research purposes
 *
 * @param request - The incoming request with scenario and framework
 * @returns Streaming text response from Claude
 *
 * @example
 * ```typescript
 * // Client-side usage with fetch
 * const response = await fetch('/api/compare', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     scenario: 'A user expresses feelings of hopelessness...',
 *     framework: 'constitutional'
 *   })
 * })
 * ```
 */
export async function POST(request: NextRequest) {
  // TODO: Implement request parsing and validation
  // const body = await request.json() as CompareRequestBody
  // const { scenario, framework } = body

  // TODO: Select appropriate system prompt based on framework
  // const systemPrompt = {
  //   hsi: HSI_PROMPT,
  //   constitutional: CONSTITUTIONAL_PROMPT,
  //   hybrid: HYBRID_PROMPT,
  // }[framework]

  // TODO: Implement streaming response
  // const result = streamText({
  //   model: anthropic('claude-sonnet-4-20250514'),
  //   system: systemPrompt,
  //   messages: [
  //     {
  //       role: 'user',
  //       content: `Please respond to this mental health scenario:\n\n${scenario}`
  //     }
  //   ],
  // })

  // TODO: Return streaming response
  // return result.toDataStreamResponse()

  // Placeholder response until implementation is complete
  return new Response(
    JSON.stringify({
      error: 'Not implemented',
      message: 'TODO: Implement streaming AI comparison endpoint',
    }),
    {
      status: 501,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

/**
 * Configuration for the API route.
 * Enables Edge runtime for optimal streaming performance.
 */
export const runtime = 'edge'
