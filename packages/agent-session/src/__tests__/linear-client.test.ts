import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LinearAgentClient } from '../linear-client'
import type { ActivityContent } from '../types'

// We test against a fake fetch to avoid real HTTP calls.
// The Linear client posts activities via GraphQL mutation.

const MOCK_TOKEN = 'lin_api_test_token'
const SESSION_ID = 'session-uuid-123'

describe('LinearAgentClient', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
  })

  it('posts a thought activity to the correct GraphQL endpoint', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { agentActivityCreate: { success: true, agentActivity: { id: 'act-1' } } },
      }),
    })

    const client = new LinearAgentClient(MOCK_TOKEN, fetchSpy)
    const activity: ActivityContent = { type: 'thought', body: 'Analyzing...' }

    const result = await client.postActivity(SESSION_ID, activity)

    expect(result.success).toBe(true)
    expect(fetchSpy).toHaveBeenCalledOnce()

    const [url, options] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.linear.app/graphql')
    expect(options.method).toBe('POST')
    expect(options.headers['Authorization']).toBe(`Bearer ${MOCK_TOKEN}`)
    expect(options.headers['Content-Type']).toBe('application/json')

    const body = JSON.parse(options.body)
    expect(body.variables.input.agentSessionId).toBe(SESSION_ID)
    expect(body.variables.input.content.type).toBe('thought')
    expect(body.variables.input.content.body).toBe('Analyzing...')
  })

  it('posts a response activity', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { agentActivityCreate: { success: true, agentActivity: { id: 'act-2' } } },
      }),
    })

    const client = new LinearAgentClient(MOCK_TOKEN, fetchSpy)
    const activity: ActivityContent = { type: 'response', body: 'Here is the status...' }

    const result = await client.postActivity(SESSION_ID, activity)

    expect(result.success).toBe(true)
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(body.variables.input.content.type).toBe('response')
  })

  it('posts an error activity', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { agentActivityCreate: { success: true, agentActivity: { id: 'act-3' } } },
      }),
    })

    const client = new LinearAgentClient(MOCK_TOKEN, fetchSpy)
    const activity: ActivityContent = { type: 'error', body: 'Something went wrong' }

    const result = await client.postActivity(SESSION_ID, activity)

    expect(result.success).toBe(true)
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(body.variables.input.content.type).toBe('error')
  })

  it('handles API errors gracefully', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    })

    const client = new LinearAgentClient(MOCK_TOKEN, fetchSpy)
    const activity: ActivityContent = { type: 'thought', body: 'test' }

    const result = await client.postActivity(SESSION_ID, activity)

    expect(result.success).toBe(false)
    expect(result.error).toContain('401')
  })

  it('handles network failures gracefully', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network error'))

    const client = new LinearAgentClient(MOCK_TOKEN, fetchSpy)
    const activity: ActivityContent = { type: 'thought', body: 'test' }

    const result = await client.postActivity(SESSION_ID, activity)

    expect(result.success).toBe(false)
    expect(result.error).toContain('Network error')
  })

  it('handles GraphQL-level errors', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { agentActivityCreate: { success: false } },
        errors: [{ message: 'Session not found' }],
      }),
    })

    const client = new LinearAgentClient(MOCK_TOKEN, fetchSpy)
    const activity: ActivityContent = { type: 'thought', body: 'test' }

    const result = await client.postActivity(SESSION_ID, activity)

    expect(result.success).toBe(false)
    expect(result.error).toContain('Session not found')
  })

  it('supports ephemeral activities', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { agentActivityCreate: { success: true, agentActivity: { id: 'act-4' } } },
      }),
    })

    const client = new LinearAgentClient(MOCK_TOKEN, fetchSpy)
    const activity: ActivityContent = { type: 'thought', body: 'Thinking...', ephemeral: true }

    await client.postActivity(SESSION_ID, activity)

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(body.variables.input.content.ephemeral).toBe(true)
  })
})
