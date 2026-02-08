import type { ParsedIntent } from '../types'
import { emitThought, emitResponse, fetchIssueDetails } from '../linear-activity'

const PRIORITY_LABELS: Record<number, string> = {
  0: 'None',
  1: 'Urgent',
  2: 'High',
  3: 'Medium',
  4: 'Low',
}

/**
 * Handle @claude status — fetch issue details and respond inline.
 * Must complete within ~5 seconds (two GraphQL calls).
 */
export async function handleStatus(
  intent: ParsedIntent,
  accessToken: string,
): Promise<void> {
  await emitThought(
    intent.sessionId,
    `Fetching status for **${intent.issueIdentifier}**...`,
    accessToken,
  )

  const issue = await fetchIssueDetails(intent.issueIdentifier, accessToken)

  const lines: string[] = [
    `## ${issue.identifier}: ${issue.title}`,
    '',
    `| Field | Value |`,
    `|-------|-------|`,
    `| **State** | ${issue.stateName} |`,
    `| **Priority** | ${PRIORITY_LABELS[issue.priority] ?? 'Unknown'} |`,
    `| **Assignee** | ${issue.assigneeName ?? 'Unassigned'} |`,
    `| **Project** | ${issue.projectName ?? 'None'} |`,
    `| **Labels** | ${issue.labels.length > 0 ? issue.labels.map(l => `\`${l}\``).join(', ') : 'None'} |`,
    `| **Updated** | ${new Date(issue.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} |`,
  ]

  await emitResponse(intent.sessionId, lines.join('\n'), accessToken)
}
