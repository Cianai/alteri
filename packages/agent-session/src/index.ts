export { verifyWebhookSignature } from './verify'
export type { VerifyResult } from './verify'

export { parseIntent } from './intent-parser'

export { AgentRegistry } from './agent-registry'

export { LinearAgentClient } from './linear-client'
export type { PostActivityResult } from './linear-client'

export { handleAgentSession } from './handler'
export type { HandleOptions, HandleResult, DispatchArgs } from './handler'

export type {
  AgentSessionEvent,
  AgentSessionCreatedEvent,
  AgentSessionPromptedEvent,
  AgentConfig,
  ActivityContent,
  ActivityType,
  DispatchTarget,
  IntentType,
  ParsedIntent,
  HandlerResult,
} from './types'
