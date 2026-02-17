import type { AgentSessionEvent, ParsedIntent, WebhookIssue } from './types'
import { verifyWebhookSignature } from './verify'
import { parseIntent } from './intent-parser'
import { LinearAgentClient } from './linear-client'

export interface HandleOptions {
  rawBody: string
  signature: string
  secret: string
  token: string
  fetchFn?: (url: string, init: RequestInit) => Promise<Response>
  dispatchFn?: (args: DispatchArgs) => Promise<void>
}

export interface DispatchArgs {
  sessionId: string
  intent: ParsedIntent
  issue: WebhookIssue
  promptContext: string
  promptBody?: string
}

export interface HandleResult {
  status: number
  body: {
    sessionId?: string
    intent?: ParsedIntent
    acknowledged?: boolean
    error?: string
  }
}

const ACK_MESSAGES: Record<string, string> = {
  status: 'Checking status for this issue...',
  expand: 'Working on expanding this issue...',
  help: 'Preparing help information...',
  unknown: 'Processing your request...',
}

export async function handleAgentSession(
  options: HandleOptions,
): Promise<HandleResult> {
  const { rawBody, signature, secret, token, fetchFn, dispatchFn } = options

  // 1. Verify webhook signature
  const verification = await verifyWebhookSignature(rawBody, signature, secret)
  if (!verification.valid) {
    return {
      status: 401,
      body: { error: verification.error },
    }
  }

  // 2. Parse event
  const event: AgentSessionEvent = JSON.parse(rawBody)

  // 3. Guard: only handle 'created' and 'prompted' actions
  if (event.action !== 'created' && event.action !== 'prompted') {
    return {
      status: 200,
      body: { error: `Ignoring action: ${(event as { action: string }).action}` },
    }
  }

  const session = event.agentSession
  if (!session?.id || !session?.issue) {
    return {
      status: 200,
      body: { error: 'Missing agentSession or issue in payload' },
    }
  }
  const sessionId = session.id

  // 4. Determine the mention text to parse
  let mentionText: string
  if (event.action === 'prompted') {
    mentionText = event.agentActivity?.body ?? ''
  } else {
    mentionText = session.comment?.body ?? ''
  }

  // 5. Parse intent
  const intent = parseIntent(mentionText)

  // 6. Post ack thought (best effort — don't fail the 200 response)
  const client = new LinearAgentClient(token, fetchFn)
  const ackMessage = ACK_MESSAGES[intent.type] || ACK_MESSAGES.unknown
  await client.postActivity(sessionId, {
    type: 'thought',
    body: ackMessage,
  }, { ephemeral: true }).catch(() => {
    // Swallow ack failures — we must return 200 to Linear
  })

  // 7. Dispatch async work — awaited so Edge function stays alive for the fetch
  if (dispatchFn) {
    const dispatchArgs: DispatchArgs = {
      sessionId,
      intent,
      issue: session.issue,
      promptContext: session.promptContext ?? '',
    }
    if (event.action === 'prompted') {
      dispatchArgs.promptBody = event.agentActivity?.body
    }
    try {
      await dispatchFn(dispatchArgs)
    } catch (err) {
      // Best effort — dispatch failure shouldn't prevent 200 response
      console.error('[agent-session] dispatch failed:', err)
    }
  }

  // 8. Return 200 immediately (within 5s deadline)
  return {
    status: 200,
    body: {
      sessionId,
      intent,
      acknowledged: true,
    },
  }
}
