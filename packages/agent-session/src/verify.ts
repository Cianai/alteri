export type VerifyResult =
  | { valid: true }
  | { valid: false; error: 'invalid_signature' | 'timestamp_expired' }

const TIMESTAMP_TOLERANCE_MS = 60_000

/**
 * Convert an ArrayBuffer to a hex string.
 */
function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Timing-safe string comparison to prevent timing attacks.
 * Compares every character regardless of mismatch position.
 */
function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

/**
 * Compute HMAC-SHA256 using the Web Crypto API (Edge Runtime compatible).
 */
async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return bufToHex(sig)
}

/**
 * Verify a Linear webhook signature using HMAC-SHA256.
 * Uses Web Crypto API for Edge Runtime compatibility.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): Promise<VerifyResult> {
  // Verify HMAC-SHA256 signature
  const expected = await hmacSha256Hex(secret, rawBody)

  if (!timingSafeCompare(expected, signature)) {
    return { valid: false, error: 'invalid_signature' }
  }

  // Verify timestamp is within tolerance
  try {
    const parsed = JSON.parse(rawBody)
    const timestamp = parsed.webhookTimestamp
    if (typeof timestamp === 'number') {
      const drift = Math.abs(Date.now() - timestamp)
      if (drift > TIMESTAMP_TOLERANCE_MS) {
        return { valid: false, error: 'timestamp_expired' }
      }
    }
  } catch {
    // If body isn't valid JSON, skip timestamp check (signature still valid)
  }

  return { valid: true }
}
