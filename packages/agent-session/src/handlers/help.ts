import type { ParsedIntent } from '../types'
import { emitResponse } from '../linear-activity'

/**
 * Handle @claude help (or unknown intents) — respond with available commands.
 */
export async function handleHelp(
  intent: ParsedIntent,
  accessToken: string,
): Promise<void> {
  const body = [
    '**Available commands:**',
    '',
    '| Command | Description |',
    '|---------|-------------|',
    '| `@claude status` | Show current issue state, assignee, priority, and labels |',
    '| `@claude expand` | Dispatch async worker to expand spec and create a PR |',
    '| `@claude help` | Show this message |',
  ].join('\n')

  await emitResponse(intent.sessionId, body, accessToken)
}
