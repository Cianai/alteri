import type { NextRequest } from 'next/server'
import {
  verifyLinearSignature,
  isTimestampValid,
  parseIntent,
  emitError,
  handleStatus,
  handleExpand,
  handleHelp,
  type AgentSessionWebhookPayload,
  type AgentSessionLog,
} from '@alteri/agent-session'

export const runtime = 'edge'
export const maxDuration = 30

// In-memory rate limiting (resets on cold start, fine for single-user)
const rateLimiter = { hour: 0, lastHour: 0, asyncHour: 0, lastAsyncHour: 0 }
const LIMITS = { hour: 10, asyncHour: 3 }

function checkRateLimit(isAsync: boolean): boolean {
  const now = Date.now()
  const hour = Math.floor(now / 3600000)

  if (hour !== rateLimiter.lastHour) {
    rateLimiter.hour = 0
    rateLimiter.lastHour = hour
  }
  if (hour !== rateLimiter.lastAsyncHour) {
    rateLimiter.asyncHour = 0
    rateLimiter.lastAsyncHour = hour
  }

  if (rateLimiter.hour >= LIMITS.hour) return false
  if (isAsync && rateLimiter.asyncHour >= LIMITS.asyncHour) return false

  rateLimiter.hour++
  if (isAsync) rateLimiter.asyncHour++
  return true
}

async function logToSupabase(log: AgentSessionLog): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) return

  try {
    await fetch(`${supabaseUrl}/rest/v1/agent_sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(log),
    })
  } catch (err) {
    console.error('Failed to log agent session to Supabase:', err)
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  // 1. Read raw body for signature verification
  const rawBody = await request.text()

  // 2. Verify webhook signature
  const secret = process.env.LINEAR_WEBHOOK_SECRET
  if (!secret) {
    console.error('LINEAR_WEBHOOK_SECRET not configured')
    return new Response('Server configuration error', { status: 500 })
  }

  const signature = request.headers.get('linear-signature')
  const isValid = await verifyLinearSignature(rawBody, signature, secret)
  if (!isValid) {
    console.error('Invalid webhook signature')
    return new Response('OK', { status: 200 })
  }

  // 3. Parse payload
  let payload: AgentSessionWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    console.error('Invalid JSON in webhook body')
    return new Response('OK', { status: 200 })
  }

  // 4. Validate timestamp (reject if >5min old)
  if (!isTimestampValid(payload.webhookTimestamp)) {
    console.error('Webhook timestamp expired')
    return new Response('OK', { status: 200 })
  }

  // 5. Only handle 'created' actions (new sessions)
  if (payload.action !== 'created') {
    return new Response('OK', { status: 200 })
  }

  // 6. Parse intent
  const intent = parseIntent(payload)
  const isAsync = intent.type === 'expand'

  // 7. Rate limit
  if (!checkRateLimit(isAsync)) {
    const accessToken = process.env.LINEAR_ACCESS_TOKEN
    if (accessToken) {
      await emitError(
        intent.sessionId,
        'Rate limit exceeded. Please try again later.',
        accessToken,
      ).catch(() => {})
    }
    return new Response('OK', { status: 200 })
  }

  // 8. Initialize log
  const log: AgentSessionLog = {
    session_id: intent.sessionId,
    issue_id: payload.agentSession.issue?.id ?? '',
    issue_identifier: intent.issueIdentifier,
    user_id: payload.appUserId ?? null,
    intent: intent.type,
    raw_mention_text: intent.rawText,
    response_type: isAsync ? 'async' : 'inline',
    first_activity_ms: null,
    github_dispatch_triggered: false,
    processing_status: 'pending',
    error_message: null,
  }

  const accessToken = process.env.LINEAR_ACCESS_TOKEN
  if (!accessToken) {
    log.processing_status = 'failed'
    log.error_message = 'LINEAR_ACCESS_TOKEN not configured'
    logToSupabase(log).catch(() => {})
    return new Response('OK', { status: 200 })
  }

  try {
    // 9. Route to handler
    switch (intent.type) {
      case 'status':
        await handleStatus(intent, accessToken)
        break

      case 'expand': {
        const ghToken = process.env.GITHUB_TOKEN
        const ghRepo = process.env.GITHUB_REPO ?? 'cianosullivan/alteri'
        if (!ghToken) {
          await emitError(intent.sessionId, 'GitHub token not configured.', accessToken)
          log.processing_status = 'failed'
          log.error_message = 'GITHUB_TOKEN not configured'
          break
        }
        const result = await handleExpand(intent, accessToken, ghToken, ghRepo)
        log.github_dispatch_triggered = result.dispatched
        break
      }

      case 'help':
      case 'unknown':
      default:
        await handleHelp(intent, accessToken)
        break
    }

    log.first_activity_ms = Date.now() - startTime
    log.processing_status = 'completed'
  } catch (err) {
    log.processing_status = 'failed'
    log.error_message = err instanceof Error ? err.message : String(err)

    // Try to emit error activity
    try {
      await emitError(
        intent.sessionId,
        'An unexpected error occurred. Please try again.',
        accessToken,
      )
    } catch {
      // Silent — we already have an error
    }
  }

  // 10. Log to Supabase (fire-and-forget)
  logToSupabase(log).catch(() => {})

  return new Response('OK', { status: 200 })
}
