import { expect, test } from '@playwright/test'
import { createSchemas } from '../../src/lib/server/schemas'
import { parseJson, requestError, sameOrigin } from '../../src/lib/server/http'
import { matchesSignature } from '../../src/lib/server/media'
import { resetRedirectUrl } from '../../src/lib/server/reset-redirect'
import { safeExternalUrl } from '../../src/lib/safe-external-url'

test('relationship validation rejects self links and incomplete parentage', () => {
  const id = '11111111-1111-4111-8111-111111111111'
  const other = '22222222-2222-4222-8222-222222222222'
  expect(createSchemas.relationships.safeParse({ person_a_id: id, person_b_id: id, kind: 'parent', parent_kind: 'biological' }).success).toBe(false)
  expect(createSchemas.relationships.safeParse({ person_a_id: id, person_b_id: other, kind: 'parent' }).success).toBe(false)
  expect(createSchemas.relationships.safeParse({ person_a_id: id, person_b_id: other, kind: 'parent', parent_kind: 'adoptive' }).success).toBe(true)
})

test('JSON parser rejects an oversized chunked body without Content-Length', async () => {
  const request = new Request('http://localhost:3000/api/admin/members', {
    method: 'POST',
    body: new ReadableStream({ start(controller) {
      controller.enqueue(new TextEncoder().encode('a'.repeat(70000)))
      controller.close()
    } }),
    duplex: 'half',
  } as RequestInit)
  let failure: unknown
  try { await parseJson(request, createSchemas.members) }
  catch (cause) { failure = cause }
  expect(failure).toBeInstanceOf(Error)
  expect((failure as Error).message).toBe('Request body is too large')
  expect(requestError(failure).status).toBe(413)
})

test('mutations reject a cross-origin Origin header', () => {
  const request = new Request('https://roots.example/api/admin/members', {
    method: 'POST', headers: { Origin: 'https://other.example' },
  })
  expect(sameOrigin(request)).toBe(false)
})

test('mutations reject cross-site browser requests without Origin', () => {
  const request = new Request('https://madhaaf.vercel.app/api/auth/logout', {
    method: 'POST', headers: { 'Sec-Fetch-Site': 'cross-site' },
  })
  expect(sameOrigin(request)).toBe(false)
  expect(sameOrigin(new Request(request.url, { method: 'POST', headers: { 'Sec-Fetch-Site': 'same-origin' } }))).toBe(true)
})

test('password recovery redirect uses the canonical host', () => {
  expect(resetRedirectUrl('', true)).toBe('https://madhaaf.vercel.app/api/auth/callback?next=/reset-password')
  expect(resetRedirectUrl('https://archive.example', true)).toBe('https://archive.example/api/auth/callback?next=/reset-password')
  expect(() => resetRedirectUrl('http://attacker.example', true)).toThrow('Invalid SITE_URL configuration')
})

test('media signature check rejects content that disagrees with MIME', () => {
  expect(matchesSignature(new Uint8Array([0xff,0xd8,0xff,0x00]), 'image/jpeg')).toBe(true)
  expect(matchesSignature(new Uint8Array([0x3c,0x73,0x63,0x72,0x69,0x70,0x74]), 'image/jpeg')).toBe(false)
})

test('editorial source URLs allow web links and reject active or deceptive schemes', () => {
  expect(safeExternalUrl('https://example.org/path')).toBe('https://example.org/path')
  for (const value of ['javascript:alert(1)', 'data:text/html,hello', '//example.org', 'https://user:pass@example.org/', 'https://example.org/\nmalicious']) {
    expect(safeExternalUrl(value), value).toBeNull()
    expect(createSchemas.sources.safeParse({ title: 'A source', url: value }).success, value).toBe(false)
  }
})
