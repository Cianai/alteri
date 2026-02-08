// --- Linear Agent Session Webhook Payload ---

export interface AgentSessionWebhookPayload {
  type: 'AgentSessionEvent'
  action: 'created' | 'prompted'
  agentSession: AgentSession
  agentActivity: AgentActivityPayload
  promptContext: string
  previousComments: unknown[]
  guidance: unknown[]
  appUserId: string
  oauthClientId: string
  organizationId: string
  webhookId: string
  webhookTimestamp: number
  createdAt: string
}

export interface AgentSession {
  id: string
  status: 'pending' | 'active' | 'error' | 'awaitingInput' | 'complete'
  issue: AgentSessionIssue
  comment: AgentSessionComment
}

export interface AgentSessionIssue {
  id: string
  identifier: string
  title: string
}

export interface AgentSessionComment {
  id: string
  body: string
}

export interface AgentActivityPayload {
  id: string
  type: string
  body: string
  createdAt: string
}

// --- Intent Classification ---

export type IntentType = 'status' | 'expand' | 'help' | 'unknown'

export interface ParsedIntent {
  type: IntentType
  rawText: string
  issueIdentifier: string
  sessionId: string
}

// --- Activity Creation ---

export type ActivityContentType = 'thought' | 'response' | 'error' | 'action'

export interface ActivityContentThought {
  type: 'thought'
  body: string
}

export interface ActivityContentResponse {
  type: 'response'
  body: string
}

export interface ActivityContentError {
  type: 'error'
  body: string
}

export interface ActivityContentAction {
  type: 'action'
  action: string
  parameter: string
  result?: string
}

export type ActivityContent =
  | ActivityContentThought
  | ActivityContentResponse
  | ActivityContentError
  | ActivityContentAction

export interface CreateActivityInput {
  agentSessionId: string
  content: ActivityContent
}

// --- Issue Details (for status handler) ---

export interface IssueDetails {
  identifier: string
  title: string
  stateName: string
  stateType: string
  priority: number
  assigneeName: string | null
  projectName: string | null
  labels: string[]
  updatedAt: string
}

// --- Supabase Logging ---

export interface AgentSessionLog {
  session_id: string
  issue_id: string
  issue_identifier: string
  user_id: string | null
  intent: IntentType
  raw_mention_text: string | null
  response_type: 'inline' | 'async'
  first_activity_ms: number | null
  github_dispatch_triggered: boolean
  processing_status: 'pending' | 'acknowledged' | 'completed' | 'failed'
  error_message: string | null
}
