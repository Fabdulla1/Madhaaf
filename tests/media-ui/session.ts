// This session is accepted only by the local fixture; it is never a production credential.
export function testSessionCookie() {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600
  const user = { id: '11111111-1111-4111-8111-111111111111', email: 'media-editor@example.test', aud: 'authenticated', role: 'authenticated' }
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const accessToken = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, aud: 'authenticated', role: 'authenticated', exp: expiresAt })}.test-signature`
  return {
    name: 'sb-127-auth-token',
    value: `base64-${encode({ access_token: accessToken, refresh_token: 'test-refresh-token', token_type: 'bearer', expires_in: 3600, expires_at: expiresAt, user })}`,
    url: 'http://127.0.0.1:3100',
  }
}
