import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHmac } from 'node:crypto'
import { handleAgentSession } from '../handler'
import type { AgentSessionCreatedEvent } from '../types'

const TEST_SECRET = 'whsec_test_secret_123'
const TEST_TOKEN = 'lin_api_test_token'
const CLAUDE_AGENT_ID = 'dd0797a4-3dd2-4ae9-add5-36a691825dc4'

function sign(body: string): string {
  return createHmac('sha256', TEST_SECRET).update(body).digest('hex')
}

function makeEvent(
  comment: string = '@claude status',
  overrides: Partial<AgentSessionCreatedEvent> = {},
): AgentSessionCreatedEvent {
  return {
    action: 'created',
    type: 'AgentSession',
    createdAt: new Date().toISOString(),
    webhookTimestamp: Date.now(),
    webhookId: 'wh-123',
    url: 'https://linear.app/cianclaude/issue/CIA-100',
    actor: { id: 'user-1', type: 'user', name: 'Cian', email: 'cian@test.com' },
    agentSession: {
      id: 'session-abc',
      issue: {
        id: 'issue-1',
        identifier: 'CIA-100',
        title: 'Test Issue',
        description: 'A test issue description',
      },
      comment: { id: 'comment-1', body: comment },
      promptContext: '<issue identifier="CIA-100"><title>Test Issue</title></issue>',
      previousComments: [],
      guidance: [],
    },
    ...overrides,
  }
}

describe('handleAgentSession', () => {
  let fetchSpy: ReturnType<typeof vi.fn>
  let dispatchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { agentActivityCreate: { success: true, agentActivity: { id: 'act-1' } } },
      }),
    })
    dispatchSpy = vi.fn().mockResolvedValue(undefined)
  })

  it('returns 401 for invalid signature', async () => {
    const event = makeEvent()
    const body = JSON.stringify(event)

    const result = await handleAgentSession({
      rawBody: body,
      signature: 'invalid',
      secret: TEST_SECRET,
      token: TEST_TOKEN,
      fetchFn: fetchSpy,
      dispatchFn: dispatchSpy,
    })

    expect(result.status).toBe(401)
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(dispatchSpy).not.toHaveBeenCalled()
  })

  it('returns 200 and posts ack thought for valid webhook', async () => {
    const event = makeEvent('@claude status')
    const body = JSON.stringify(event)
    const signature = sign(body)

    const result = await handleAgentSession({
      rawBody: body,
      signature,
      secret: TEST_SECRET,
      token: TEST_TOKEN,
      fetchFn: fetchSpy,
      dispatchFn: dispatchSpy,
    })

    expect(result.status).toBe(200)
    // Should have posted an ack thought
    expect(fetchSpy).toHaveBeenCalledOnce()
    const callBody = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(callBody.variables.input.agentSessionId).toBe('session-abc')
    expect(callBody.variables.input.content.type).toBe('thought')
  })

  it('dispatches async work after ack', async () => {
    const event = makeEvent('@claude expand this')
    const body = JSON.stringify(event)
    const signature = sign(body)

    await handleAgentSession({
      rawBody: body,
      signature,
      secret: TEST_SECRET,
      token: TEST_TOKEN,
      fetchFn: fetchSpy,
      dispatchFn: dispatchSpy,
    })

    expect(dispatchSpy).toHaveBeenCalledOnce()
    const [dispatchArgs] = dispatchSpy.mock.calls[0]
    expect(dispatchArgs.sessionId).toBe('session-abc')
    expect(dispatchArgs.intent.type).toBe('expand')
    expect(dispatchArgs.issue.identifier).toBe('CIA-100')
  })

  it('includes intent type in the ack thought body', async () => {
    const event = makeEvent('@claude help')
    const body = JSON.stringify(event)
    const signature = sign(body)

    await handleAgentSession({
      rawBody: body,
      signature,
      secret: TEST_SECRET,
      token: TEST_TOKEN,
      fetchFn: fetchSpy,
      dispatchFn: dispatchSpy,
    })

    const callBody = JSON.parse(fetchSpy.mock.calls[0][1].body)
    const thoughtBody: string = callBody.variables.input.content.body
    expect(thoughtBody.toLowerCase()).toContain('help')
  })

  it('returns 200 even if ack post fails (best effort)', async () => {
    fetchSpy.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' })
    const event = makeEvent('@claude status')
    const body = JSON.stringify(event)
    const signature = sign(body)

    const result = await handleAgentSession({
      rawBody: body,
      signature,
      secret: TEST_SECRET,
      token: TEST_TOKEN,
      fetchFn: fetchSpy,
      dispatchFn: dispatchSpy,
    })

    // Must return 200 to Linear regardless — the 5s deadline is for HTTP response
    expect(result.status).toBe(200)
  })

  it('handles prompted events (follow-up messages)', async () => {
    const event = {
      action: 'prompted' as const,
      type: 'AgentSession' as const,
      createdAt: new Date().toISOString(),
      webhookTimestamp: Date.now(),
      webhookId: 'wh-456',
      url: 'https://linear.app/cianclaude/issue/CIA-100',
      actor: { id: 'user-1', type: 'user' as const, name: 'Cian', email: 'cian@test.com' },
      agentSession: {
        id: 'session-abc',
        issue: { id: 'issue-1', identifier: 'CIA-100', title: 'Test', description: null },
        comment: null,
        promptContext: '',
        previousComments: [],
        guidance: [],
      },
      agentActivity: { type: 'prompt' as const, body: 'Can you also add acceptance criteria?' },
    }
    const body = JSON.stringify(event)
    const signature = sign(body)

    const result = await handleAgentSession({
      rawBody: body,
      signature,
      secret: TEST_SECRET,
      token: TEST_TOKEN,
      fetchFn: fetchSpy,
      dispatchFn: dispatchSpy,
    })

    expect(result.status).toBe(200)
    expect(dispatchSpy).toHaveBeenCalledOnce()
  })

  it('returns parseable JSON body with session info', async () => {
    const event = makeEvent('@claude status')
    const body = JSON.stringify(event)
    const signature = sign(body)

    const result = await handleAgentSession({
      rawBody: body,
      signature,
      secret: TEST_SECRET,
      token: TEST_TOKEN,
      fetchFn: fetchSpy,
      dispatchFn: dispatchSpy,
    })

    expect(result.body.sessionId).toBe('session-abc')
    expect(result.body.intent).toBeDefined()
    expect(result.body.acknowledged).toBe(true)
  })
})
