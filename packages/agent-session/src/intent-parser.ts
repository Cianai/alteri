import type { AgentSessionWebhookPayload, ParsedIntent, IntentType } from './types'

const INTENT_PATTERNS: Array<{ pattern: RegExp; type: IntentType }> = [
  { pattern: /^\s*status\b/i, type: 'status' },
  { pattern: /^\s*expand\b/i, type: 'expand' },
  { pattern: /^\s*help\b/i, type: 'help' },
]

/**
 * Parse the user's intent from the webhook payload.
 * Extracts the comment body, strips the @claude mention, and classifies via regex.
 */
export function parseIntent(payload: AgentSessionWebhookPayload): ParsedIntent {
  const commentBody = payload.agentSession.comment?.body ?? ''
  const issueIdentifier = payload.agentSession.issue?.identifier ?? 'UNKNOWN'
  const sessionId = payload.agentSession.id

  // Strip @claude / @Claude mention prefix (may include markdown formatting)
  const stripped = commentBody
    .replace(/@claude\b/gi, '')
    .trim()

  // Classify intent
  let type: IntentType = 'unknown'
  for (const rule of INTENT_PATTERNS) {
    if (rule.pattern.test(stripped)) {
      type = rule.type
      break
    }
  }

  return {
    type,
    rawText: stripped,
    issueIdentifier,
    sessionId,
  }
}
