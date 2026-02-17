import type { ActivityContent } from './types'

const LINEAR_API_URL = 'https://api.linear.app/graphql'

const MUTATION = `
mutation AgentActivityCreate($input: AgentActivityCreateInput!) {
  agentActivityCreate(input: $input) {
    success
    agentActivity { id }
  }
}
`

export interface PostActivityResult {
  success: boolean
  activityId?: string
  error?: string
}

type FetchFn = (url: string, init: RequestInit) => Promise<Response>

export class LinearAgentClient {
  private token: string
  private fetchFn: FetchFn

  constructor(token: string, fetchFn?: FetchFn) {
    this.token = token
    this.fetchFn = fetchFn ?? globalThis.fetch.bind(globalThis)
  }

  async postActivity(
    sessionId: string,
    content: ActivityContent,
  ): Promise<PostActivityResult> {
    try {
      const response = await this.fetchFn(LINEAR_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: MUTATION,
          variables: {
            input: {
              agentSessionId: sessionId,
              content,
            },
          },
        }),
      })

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status} ${response.statusText}`,
        }
      }

      const json = await response.json() as {
        errors?: { message: string }[]
        data?: { agentActivityCreate?: { success: boolean; agentActivity?: { id: string } } }
      }

      if (json.errors?.length) {
        return {
          success: false,
          error: json.errors.map((e) => e.message).join(', '),
        }
      }

      const result = json.data?.agentActivityCreate
      if (!result?.success) {
        return {
          success: false,
          error: 'Activity creation failed',
        }
      }

      return {
        success: true,
        activityId: result.agentActivity?.id,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }
    }
  }
}
