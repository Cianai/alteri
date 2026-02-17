/**
 * Linear webhook signature verification using Web Crypto API.
 * Edge runtime compatible (no Node.js crypto module).
 */

const encoder = new TextEncoder()

/**
 * Verify the HMAC-SHA256 signature from the Linear-Signature header.
 * Uses Web Crypto API for Edge runtime compatibility.
 *
 * IMPORTANT: rawBody must be the original request body string,
 * NOT a re-serialized JSON object. Use request.text() before JSON.parse().
 */
export async function verifyLinearSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): Promise<boolean> {
  if (!signature) return false

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(rawBody),
  )

  const computed = bufferToHex(signatureBytes)

  return constantTimeEqual(computed, signature)
}

/**
 * Validate webhook timestamp to prevent replay attacks.
 * Rejects payloads older than maxAgeSeconds (default 5 minutes).
 */
export function isTimestampValid(
  webhookTimestamp: number,
  maxAgeSeconds: number = 300,
): boolean {
  const age = Math.abs(Date.now() - webhookTimestamp)
  return age < maxAgeSeconds * 1000
}

/** Convert ArrayBuffer to lowercase hex string */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Compares every character regardless of match (no early return),
 * and incorporates length differences into the comparison.
 */
function constantTimeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length)
  let mismatch = a.length ^ b.length

  for (let i = 0; i < len; i++) {
    const aCode = i < a.length ? a.charCodeAt(i) : 0
    const bCode = i < b.length ? b.charCodeAt(i) : 0
    mismatch |= aCode ^ bCode
  }
  return mismatch === 0
}
