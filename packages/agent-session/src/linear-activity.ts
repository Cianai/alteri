import type { CreateActivityInput, IssueDetails } from './types'

const LINEAR_API = 'https://api.linear.app/graphql'

/**
 * Emit an agent activity to a Linear agent session.
 * Session state transitions automatically based on activity type:
 *   thought/action → active
 *   response/error → complete
 */
export async function createActivity(
  input: CreateActivityInput,
  accessToken: string,
): Promise<void> {
  const mutation = `
    mutation CreateAgentActivity($input: AgentActivityCreateInput!) {
      agentActivityCreate(input: $input) {
        success
      }
    }
  `

  const variables = {
    input: {
      agentSessionId: input.agentSessionId,
      content: input.content,
    },
  }

  const response = await fetch(LINEAR_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({ query: mutation, variables }),
  })

  if (!response.ok) {
    throw new Error(`Linear API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  if (!data.data?.agentActivityCreate?.success) {
    throw new Error(`Activity creation failed: ${JSON.stringify(data.errors ?? data)}`)
  }
}

/** Helper: emit a thought activity */
export async function emitThought(
  sessionId: string,
  body: string,
  accessToken: string,
): Promise<void> {
  await createActivity(
    { agentSessionId: sessionId, content: { type: 'thought', body } },
    accessToken,
  )
}

/** Helper: emit a response activity (completes the session) */
export async function emitResponse(
  sessionId: string,
  body: string,
  accessToken: string,
): Promise<void> {
  await createActivity(
    { agentSessionId: sessionId, content: { type: 'response', body } },
    accessToken,
  )
}

/** Helper: emit an error activity (completes the session with error) */
export async function emitError(
  sessionId: string,
  body: string,
  accessToken: string,
): Promise<void> {
  await createActivity(
    { agentSessionId: sessionId, content: { type: 'error', body } },
    accessToken,
  )
}

/**
 * Fetch issue details from Linear for the status handler.
 */
export async function fetchIssueDetails(
  identifier: string,
  accessToken: string,
): Promise<IssueDetails> {
  const query = `
    query IssueDetails($filter: IssueFilter!) {
      issueSearch(filter: $filter, first: 1) {
        nodes {
          identifier
          title
          state { name type }
          priority
          assignee { name }
          project { name }
          labels { nodes { name } }
          updatedAt
        }
      }
    }
  `

  const variables = {
    filter: { identifier: { eq: identifier } },
  }

  const response = await fetch(LINEAR_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Linear API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const node = data.data?.issueSearch?.nodes?.[0]

  if (!node) {
    throw new Error(`Issue ${identifier} not found`)
  }

  return {
    identifier: node.identifier,
    title: node.title,
    stateName: node.state?.name ?? 'Unknown',
    stateType: node.state?.type ?? 'unknown',
    priority: node.priority ?? 0,
    assigneeName: node.assignee?.name ?? null,
    projectName: node.project?.name ?? null,
    labels: (node.labels?.nodes ?? []).map((l: { name: string }) => l.name),
    updatedAt: node.updatedAt,
  }
}
