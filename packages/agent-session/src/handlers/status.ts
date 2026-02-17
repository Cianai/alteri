import type { LinearAgentClient } from '../linear-client'
import type { HandlerContext } from '../types'

export async function handleStatus(
  ctx: HandlerContext,
  client: LinearAgentClient,
): Promise<string> {
  const result = await client.getIssueStatus(ctx.issueId)

  if (result.error || !result.data) {
    return `**Status for ${ctx.issueIdentifier}**\n\nUnable to fetch issue details: ${result.error ?? 'unknown error'}`
  }

  const issue = result.data
  const lines: string[] = []

  // Header
  lines.push(`**Status for ${issue.identifier}: ${issue.title}**`)
  lines.push('')
  lines.push(`| Field | Value |`)
  lines.push(`|-------|-------|`)
  lines.push(`| Status | ${issue.state.name} |`)
  lines.push(`| Assignee | ${issue.assignee?.name ?? 'Unassigned'} |`)
  lines.push(`| Priority | ${priorityLabel(issue.priority)} |`)
  lines.push(`| Estimate | ${issue.estimate ?? '—'} |`)

  const labels = issue.labels.nodes.map(l => l.name)
  if (labels.length > 0) {
    lines.push(`| Labels | ${labels.join(', ')} |`)
  }

  // Sub-issues
  const children = issue.children.nodes
  if (children.length > 0) {
    lines.push('')
    lines.push(`### Sub-issues (${children.length})`)
    lines.push('')
    lines.push(`| Issue | Title | Status | Assignee |`)
    lines.push(`|-------|-------|--------|----------|`)
    for (const child of children) {
      lines.push(
        `| ${child.identifier} | ${child.title} | ${child.state.name} | ${child.assignee?.name ?? '—'} |`,
      )
    }
  }

  // Linked PRs / Attachments
  const attachments = issue.attachments.nodes
  const prAttachments = attachments.filter(a => a.url.includes('github.com') && a.url.includes('/pull/'))
  if (prAttachments.length > 0) {
    lines.push('')
    lines.push(`### Linked PRs (${prAttachments.length})`)
    lines.push('')
    for (const pr of prAttachments) {
      lines.push(`- [${pr.title}](${pr.url})`)
    }
  }

  // Recent activity
  const comments = issue.comments.nodes
  if (comments.length > 0) {
    lines.push('')
    lines.push(`### Recent Activity (last ${comments.length})`)
    lines.push('')
    for (const comment of comments) {
      const date = new Date(comment.createdAt).toISOString().slice(0, 10)
      const snippet = comment.body.slice(0, 120).replace(/\n/g, ' ')
      const author = comment.user?.name ?? 'Bot'
      lines.push(`- **${author}** (${date}): ${snippet}${comment.body.length > 120 ? '...' : ''}`)
    }
  }

  return lines.join('\n')
}

function priorityLabel(priority: number): string {
  switch (priority) {
    case 0: return 'None'
    case 1: return 'Urgent'
    case 2: return 'High'
    case 3: return 'Normal'
    case 4: return 'Low'
    default: return String(priority)
  }
}
