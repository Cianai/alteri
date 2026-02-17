import { handleAgentSession } from '@alteri/agent-session'
import type { DispatchArgs } from '@alteri/agent-session'
import type { NextRequest } from 'next/server'
import { after } from 'next/server'

/**
 * Dispatch the async worker via GitHub Actions workflow_dispatch.
 * Runs inside `after()` so the Edge function stays alive until the fetch completes.
 */
async function dispatchToWorker(args: DispatchArgs): Promise<void> {
  const ghToken = process.env.GITHUB_TOKEN
  if (!ghToken) return

  await fetch(
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
}

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

  // Track dispatch args so we can schedule them in after()
  let pendingDispatch: DispatchArgs | null = null

  const result = await handleAgentSession({
    rawBody,
    signature,
    secret,
    token,
    dispatchFn: async (args) => {
      // Don't dispatch inline — capture args for after() below
      pendingDispatch = args
    },
  })

  // Schedule dispatch to run after the response is sent.
  // next/server after() keeps the Edge function alive until this completes,
  // preventing the unawaited fetch from being silently dropped.
  if (pendingDispatch) {
    after(async () => {
      try {
        await dispatchToWorker(pendingDispatch!)
      } catch {
        // Best effort — dispatch failure shouldn't surface to Linear
      }
    })
  }

  return Response.json(result.body, { status: result.status })
}

export const runtime = 'edge'
