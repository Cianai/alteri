import { describe, it, expect } from 'vitest'
import { createHmac } from 'node:crypto'
import { verifyWebhookSignature } from '../verify'

const TEST_SECRET = 'whsec_test_secret_123'

function sign(body: string, secret: string = TEST_SECRET): string {
  return createHmac('sha256', secret).update(body).digest('hex')
}

function nowMs(): number {
  return Date.now()
}

describe('verifyWebhookSignature', () => {
  it('accepts a valid signature with current timestamp', async () => {
    const body = JSON.stringify({
      action: 'created',
      type: 'AgentSession',
      webhookTimestamp: nowMs(),
    })
    const signature = sign(body)

    const result = await verifyWebhookSignature(body, signature, TEST_SECRET)

    expect(result.valid).toBe(true)
  })

  it('rejects an invalid signature', async () => {
    const body = JSON.stringify({
      action: 'created',
      type: 'AgentSession',
      webhookTimestamp: nowMs(),
    })

    const result = await verifyWebhookSignature(body, 'bad_signature', TEST_SECRET)

    expect(result.valid).toBe(false)
    expect(result).toEqual({ valid: false, error: 'invalid_signature' })
  })

  it('rejects a signature computed with the wrong secret', async () => {
    const body = JSON.stringify({
      action: 'created',
      type: 'AgentSession',
      webhookTimestamp: nowMs(),
    })
    const wrongSignature = sign(body, 'wrong_secret')

    const result = await verifyWebhookSignature(body, wrongSignature, TEST_SECRET)

    expect(result.valid).toBe(false)
    expect(result).toEqual({ valid: false, error: 'invalid_signature' })
  })

  it('rejects a timestamp older than 60 seconds', async () => {
    const oldTimestamp = Date.now() - 120_000 // 2 minutes ago
    const body = JSON.stringify({
      action: 'created',
      type: 'AgentSession',
      webhookTimestamp: oldTimestamp,
    })
    const signature = sign(body)

    const result = await verifyWebhookSignature(body, signature, TEST_SECRET)

    expect(result.valid).toBe(false)
    expect(result).toEqual({ valid: false, error: 'timestamp_expired' })
  })

  it('rejects a timestamp from the future beyond 60 seconds', async () => {
    const futureTimestamp = Date.now() + 120_000 // 2 minutes in future
    const body = JSON.stringify({
      action: 'created',
      type: 'AgentSession',
      webhookTimestamp: futureTimestamp,
    })
    const signature = sign(body)

    const result = await verifyWebhookSignature(body, signature, TEST_SECRET)

    expect(result.valid).toBe(false)
    expect(result).toEqual({ valid: false, error: 'timestamp_expired' })
  })

  it('accepts a timestamp within the 60-second window', async () => {
    const recentTimestamp = Date.now() - 30_000 // 30 seconds ago
    const body = JSON.stringify({
      action: 'created',
      type: 'AgentSession',
      webhookTimestamp: recentTimestamp,
    })
    const signature = sign(body)

    const result = await verifyWebhookSignature(body, signature, TEST_SECRET)

    expect(result.valid).toBe(true)
  })

  it('rejects when body has been tampered with after signing', async () => {
    const originalBody = JSON.stringify({
      action: 'created',
      type: 'AgentSession',
      webhookTimestamp: nowMs(),
    })
    const signature = sign(originalBody)
    const tamperedBody = JSON.stringify({
      action: 'created',
      type: 'AgentSession',
      webhookTimestamp: nowMs(),
      extra: 'injected',
    })

    const result = await verifyWebhookSignature(tamperedBody, signature, TEST_SECRET)

    expect(result.valid).toBe(false)
    expect(result).toEqual({ valid: false, error: 'invalid_signature' })
  })

  it('uses the raw body string for verification, not re-parsed JSON', async () => {
    // The raw body might have different whitespace than JSON.stringify
    const rawBody = '{"action":"created","type":"AgentSession","webhookTimestamp":' + nowMs() + '}'
    const signature = sign(rawBody)

    const result = await verifyWebhookSignature(rawBody, signature, TEST_SECRET)

    expect(result.valid).toBe(true)
  })
})
