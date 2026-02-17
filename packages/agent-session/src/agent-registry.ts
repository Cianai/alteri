import type { AgentConfig, IntentType } from './types'

function normalizeMention(mention: string): string {
  const stripped = mention.startsWith('@') ? mention.slice(1) : mention
  return stripped.toLowerCase()
}

export class AgentRegistry {
  private byMention = new Map<string, AgentConfig>()
  private byId = new Map<string, AgentConfig>()

  register(config: AgentConfig): void {
    this.byMention.set(normalizeMention(config.mentionName), config)
    this.byId.set(config.id, config)
  }

  getByMention(mention: string): AgentConfig | undefined {
    return this.byMention.get(normalizeMention(mention))
  }

  getById(id: string): AgentConfig | undefined {
    return this.byId.get(id)
  }

  supportsIntent(mention: string, intent: IntentType): boolean {
    const agent = this.getByMention(mention)
    if (!agent) return false
    return agent.intents.includes(intent)
  }

  listAgents(): AgentConfig[] {
    return Array.from(this.byMention.values())
  }
}
