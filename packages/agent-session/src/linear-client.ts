import type { ActivityContent } from './types'

const LINEAR_API_URL = 'https://api.linear.app/graphql'

const ACTIVITY_MUTATION = `
mutation AgentActivityCreate($input: AgentActivityCreateInput!) {
  agentActivityCreate(input: $input) {
    success
    agentActivity { id }
  }
}
`

const ISSUE_STATUS_QUERY = `
query IssueStatus($id: String!) {
  issue(id: $id) {
    id
    identifier
    title
    description
    state { name }
    assignee { name }
    labels { nodes { name } }
    estimate
    priority
    children {
      nodes {
        identifier
        title
        state { name }
        assignee { name }
      }
    }
    attachments {
      nodes {
        title
        url
        subtitle
      }
    }
    comments(last: 5) {
      nodes {
        body
        createdAt
        user { name }
      }
    }
  }
}
`

export interface PostActivityResult {
  success: boolean
  activityId?: string
  error?: string
}

export interface IssueStatusData {
  id: string
  identifier: string
  title: string
  description: string | null
  state: { name: string }
  assignee: { name: string } | null
  labels: { nodes: { name: string }[] }
  estimate: number | null
  priority: number
  children: {
    nodes: {
      identifier: string
      title: string
      state: { name: string }
      assignee: { name: string } | null
    }[]
  }
  attachments: {
    nodes: {
      title: string
      url: string
      subtitle: string | null
    }[]
  }
  comments: {
    nodes: {
      body: string
      createdAt: string
      user: { name: string } | null
    }[]
  }
}

type FetchFn = (url: string, init: RequestInit) => Promise<Response>

export class LinearAgentClient {
  private token: string
  private fetchFn: FetchFn

  constructor(token: string, fetchFn?: FetchFn) {
    this.token = token
    this.fetchFn = fetchFn ?? globalThis.fetch.bind(globalThis)
  }

  private async graphql<T>(query: string, variables: Record<string, unknown>): Promise<{
    data?: T
    error?: string
  }> {
    try {
      const response = await this.fetchFn(LINEAR_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      })

      if (!response.ok) {
        return { error: `HTTP ${response.status} ${response.statusText}` }
      }

      const json = await response.json() as {
        errors?: { message: string }[]
        data?: T
      }

      if (json.errors?.length) {
        return { error: json.errors.map((e) => e.message).join(', ') }
      }

      return { data: json.data }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  async postActivity(
    sessionId: string,
    content: ActivityContent,
  ): Promise<PostActivityResult> {
    const result = await this.graphql<{
      agentActivityCreate?: { success: boolean; agentActivity?: { id: string } }
    }>(ACTIVITY_MUTATION, {
      input: {
        agentSessionId: sessionId,
        content,
      },
    })

    if (result.error) {
      return { success: false, error: result.error }
    }

    const activity = result.data?.agentActivityCreate
    if (!activity?.success) {
      return { success: false, error: 'Activity creation failed' }
    }

    return {
      success: true,
      activityId: activity.agentActivity?.id,
    }
  }

  async getIssueStatus(issueId: string): Promise<{
    data?: IssueStatusData
    error?: string
  }> {
    const result = await this.graphql<{ issue: IssueStatusData }>(
      ISSUE_STATUS_QUERY,
      { id: issueId },
    )

    if (result.error) {
      return { error: result.error }
    }

    if (!result.data?.issue) {
      return { error: 'Issue not found' }
    }

    return { data: result.data.issue }
  }
}
