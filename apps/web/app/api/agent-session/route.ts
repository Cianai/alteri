import { handleAgentSession } from '@alteri/agent-session'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('Linear-Signature')
  if (!signature) {
    return Response.json({ error: 'missing_signature' }, { status: 401 })
  }

  const secret = process.env.LINEAR_WEBHOOK_SECRET
  const token = process.env.LINEAR_AGENT_TOKEN
  if (!secret || !token) {
    return Response.json({ error: 'misconfigured' }, { status: 500 })
  }

  const rawBody = await request.text()

  const result = await handleAgentSession({
    rawBody,
    signature,
    secret,
    token,
    dispatchFn: async (args) => {
      const ghToken = process.env.GITHUB_TOKEN
      if (!ghToken) {
        console.error('[agent-session] GITHUB_TOKEN not set, skipping dispatch')
        return
      }

      const response = await fetch(
        'https://api.github.com/repos/cianos95-dev/alteri/actions/workflows/agent-session-worker.yml/dispatches',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ghToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({
            ref: 'main',
            inputs: {
              session_id: args.sessionId,
              intent_type: args.intent.type,
              issue_id: args.issue.identifier,
              prompt_context: args.promptContext,
              ...(args.promptBody ? { prompt_body: args.promptBody } : {}),
            },
          }),
        },
      )

      if (!response.ok) {
        const body = await response.text().catch(() => '')
        console.error(
          `[agent-session] GitHub dispatch failed: ${response.status} ${response.statusText}`,
          body,
        )
      }
    },
  })

  return Response.json(result.body, { status: result.status })
}

export const runtime = 'edge'
