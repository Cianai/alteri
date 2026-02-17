/**
 * Linear Agent Sessions webhook payload types.
 * Based on: https://linear.app/docs/agent-sessions
 */

// --- Webhook Payload ---

export interface WebhookActor {
  id: string
  type: 'user'
  name: string
  email: string
}

export interface WebhookIssue {
  id: string
  identifier: string
  title: string
  description: string | null
}

export interface WebhookComment {
  id: string
  body: string
}

export interface AgentSession {
  id: string
  issue: WebhookIssue
  comment: WebhookComment | null
  promptContext: string
  previousComments: WebhookComment[]
  guidance: string[]
}

export interface AgentSessionCreatedEvent {
  action: 'created'
  type: 'AgentSession'
  createdAt: string
  webhookTimestamp: number
  webhookId: string
  url: string
  actor: WebhookActor
  agentSession: AgentSession
}

export interface AgentSessionPromptedEvent {
  action: 'prompted'
  type: 'AgentSession'
  createdAt: string
  webhookTimestamp: number
  webhookId: string
  url: string
  actor: WebhookActor
  agentSession: AgentSession
  agentActivity: {
    type: 'prompt'
    body: string
  }
}

export type AgentSessionEvent =
  | AgentSessionCreatedEvent
  | AgentSessionPromptedEvent

// --- Activity Types (for posting responses) ---

export type ActivityType = 'thought' | 'elicitation' | 'action' | 'response' | 'error'

export interface ActivityContent {
  type: ActivityType
  body?: string
  action?: string
  parameter?: string
  result?: string
}

// --- Intent Parser ---

export type IntentType = 'status' | 'expand' | 'help' | 'unknown'

export interface ParsedIntent {
  type: IntentType
  rawText: string
  agentMention: string
  remainingText: string
}

// --- Handler Context ---

export interface HandlerContext {
  sessionId: string
  issueId: string
  issueIdentifier: string
  promptContext: string
  commentBody: string
}

// --- Agent Registry ---

export interface AgentConfig {
  id: string
  name: string
  mentionName: string
  intents: IntentType[]
  dispatchTarget: DispatchTarget
}

export type DispatchTarget =
  | { type: 'github-actions'; workflow: string; inputs: Record<string, string> }
  | { type: 'webhook'; url: string }
  | { type: 'inline' }

