import type { ParsedIntent } from '../types'
import { emitThought, emitResponse, emitError } from '../linear-activity'

/**
 * Handle @claude expand — dispatch to GitHub Actions async worker.
 * Acknowledges immediately, actual expansion happens in the workflow.
 */
export async function handleExpand(
  intent: ParsedIntent,
  accessToken: string,
  githubToken: string,
  githubRepo: string,
): Promise<{ dispatched: boolean }> {
  await emitThought(
    intent.sessionId,
    `Dispatching async worker to expand **${intent.issueIdentifier}**. This may take a few minutes...`,
    accessToken,
  )

  try {
    const resp = await fetch(
      `https://api.github.com/repos/${githubRepo}/actions/workflows/agent-session-worker.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${githubToken}`,
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            issue_id: intent.issueIdentifier,
            session_id: intent.sessionId,
            intent: 'expand',
          },
        }),
      },
    )

    if (!resp.ok) {
      const body = await resp.text()
      await emitError(
        intent.sessionId,
        `Failed to dispatch expansion workflow: ${resp.status} ${body}`,
        accessToken,
      )
      return { dispatched: false }
    }

    await emitResponse(
      intent.sessionId,
      [
        `Expansion dispatched for **${intent.issueIdentifier}**.`,
        '',
        'A GitHub Actions worker will:',
        '1. Fetch the spec from this issue',
        '2. Expand acceptance criteria and implementation details',
        '3. Create a PR with the changes',
        '',
        'Check the Actions tab for progress.',
      ].join('\n'),
      accessToken,
    )

    return { dispatched: true }
  } catch (err) {
    await emitError(
      intent.sessionId,
      `Unexpected error dispatching workflow: ${err instanceof Error ? err.message : String(err)}`,
      accessToken,
    )
    return { dispatched: false }
  }
}
