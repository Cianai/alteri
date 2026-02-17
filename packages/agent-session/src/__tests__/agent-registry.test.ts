import { describe, it, expect } from 'vitest'
import { AgentRegistry } from '../agent-registry'
import type { AgentConfig } from '../types'

const CLAUDE_CONFIG: AgentConfig = {
  id: 'dd0797a4-3dd2-4ae9-add5-36a691825dc4',
  name: 'Claude',
  mentionName: 'claude',
  intents: ['status', 'expand', 'help', 'unknown'],
  dispatchTarget: {
    type: 'github-actions',
    workflow: 'agent-session-worker.yml',
    inputs: {},
  },
}

const CURSOR_CONFIG: AgentConfig = {
  id: 'cursor-agent-id',
  name: 'Cursor',
  mentionName: 'cursor',
  intents: ['unknown'],
  dispatchTarget: {
    type: 'webhook',
    url: 'https://cursor.example.com/webhook',
  },
}

describe('AgentRegistry', () => {
  it('registers and retrieves an agent by mention name', () => {
    const registry = new AgentRegistry()
    registry.register(CLAUDE_CONFIG)

    const agent = registry.getByMention('@claude')

    expect(agent).toBeDefined()
    expect(agent!.name).toBe('Claude')
    expect(agent!.id).toBe('dd0797a4-3dd2-4ae9-add5-36a691825dc4')
  })

  it('returns undefined for unregistered mention', () => {
    const registry = new AgentRegistry()
    registry.register(CLAUDE_CONFIG)

    const agent = registry.getByMention('@sentry')

    expect(agent).toBeUndefined()
  })

  it('is case-insensitive for mention lookup', () => {
    const registry = new AgentRegistry()
    registry.register(CLAUDE_CONFIG)

    expect(registry.getByMention('@Claude')).toBeDefined()
    expect(registry.getByMention('@CLAUDE')).toBeDefined()
  })

  it('registers multiple agents', () => {
    const registry = new AgentRegistry()
    registry.register(CLAUDE_CONFIG)
    registry.register(CURSOR_CONFIG)

    expect(registry.getByMention('@claude')).toBeDefined()
    expect(registry.getByMention('@cursor')).toBeDefined()
  })

  it('retrieves an agent by workspace-scoped agent ID', () => {
    const registry = new AgentRegistry()
    registry.register(CLAUDE_CONFIG)

    const agent = registry.getById('dd0797a4-3dd2-4ae9-add5-36a691825dc4')

    expect(agent).toBeDefined()
    expect(agent!.name).toBe('Claude')
  })

  it('returns undefined for unregistered agent ID', () => {
    const registry = new AgentRegistry()
    registry.register(CLAUDE_CONFIG)

    expect(registry.getById('nonexistent-id')).toBeUndefined()
  })

  it('checks if an agent supports a given intent', () => {
    const registry = new AgentRegistry()
    registry.register(CLAUDE_CONFIG)

    expect(registry.supportsIntent('@claude', 'status')).toBe(true)
    expect(registry.supportsIntent('@claude', 'expand')).toBe(true)
    expect(registry.supportsIntent('@claude', 'help')).toBe(true)
  })

  it('reports unsupported intents correctly', () => {
    const registry = new AgentRegistry()
    registry.register(CURSOR_CONFIG)

    expect(registry.supportsIntent('@cursor', 'status')).toBe(false)
    expect(registry.supportsIntent('@cursor', 'unknown')).toBe(true)
  })

  it('returns false for intent check on unregistered agent', () => {
    const registry = new AgentRegistry()

    expect(registry.supportsIntent('@nobody', 'status')).toBe(false)
  })

  it('lists all registered agents', () => {
    const registry = new AgentRegistry()
    registry.register(CLAUDE_CONFIG)
    registry.register(CURSOR_CONFIG)

    const agents = registry.listAgents()

    expect(agents).toHaveLength(2)
    expect(agents.map(a => a.name).sort()).toEqual(['Claude', 'Cursor'])
  })

  it('handles @ prefix being optional in mention lookup', () => {
    const registry = new AgentRegistry()
    registry.register(CLAUDE_CONFIG)

    expect(registry.getByMention('claude')).toBeDefined()
    expect(registry.getByMention('@claude')).toBeDefined()
  })
})
