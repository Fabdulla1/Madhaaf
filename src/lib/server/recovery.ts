import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

export const recoveryCookie = 'madhaaf_password_recovery'

function signingKey() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('Recovery signing key is unavailable')
  return key
}

function signature(payload: string) {
  return createHmac('sha256', signingKey()).update(payload).digest('base64url')
}

export function recoveryToken(userId: string) {
  const payload = `${userId}.${Math.floor(Date.now() / 1000) + 900}`
  return `${payload}.${signature(payload)}`
}

export function validRecoveryToken(token: string | undefined, userId: string) {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== userId) return false
  const expires = Number(parts[1])
  if (!Number.isSafeInteger(expires) || expires < Math.floor(Date.now() / 1000)) return false
  const expected = Buffer.from(signature(`${parts[0]}.${parts[1]}`))
  const supplied = Buffer.from(parts[2])
  return expected.length === supplied.length && timingSafeEqual(expected, supplied)
}
