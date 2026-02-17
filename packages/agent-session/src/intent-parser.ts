import type { IntentType, ParsedIntent } from './types'

const STATUS_KEYWORDS = ['status', 'update', 'progress', 'where are we', 'how is']
const EXPAND_KEYWORDS = ['expand', 'spec', 'flesh', 'elaborate', 'detail', 'write a spec', 'break down']
const HELP_KEYWORDS = ['help', 'what can you do', 'commands', 'capabilities']

const MENTION_REGEX = /^\s*(@\w+)\s*/

function matchesAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some(kw => lower.includes(kw))
}

function classifyIntent(text: string): IntentType {
  if (matchesAny(text, HELP_KEYWORDS)) return 'help'
  if (matchesAny(text, STATUS_KEYWORDS)) return 'status'
  if (matchesAny(text, EXPAND_KEYWORDS)) return 'expand'
  return 'unknown'
}

export function parseIntent(text: string): ParsedIntent {
  const rawText = text ?? ''
  const trimmed = rawText.trim()

  const mentionMatch = trimmed.match(MENTION_REGEX)
  const agentMention = mentionMatch ? mentionMatch[1] : ''
  const remainingText = mentionMatch
    ? trimmed.slice(mentionMatch[0].length).trim()
    : trimmed

  const type = classifyIntent(remainingText)

  return {
    type,
    rawText,
    agentMention,
    remainingText,
  }
}
