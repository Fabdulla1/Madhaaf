import { expect, test } from '@playwright/test'
import { testSessionCookie } from './session'

const mediaId = '33333333-3333-4333-8333-333333333333'
const filePath = `/api/media/${mediaId}/file`
const stateUrl = 'http://127.0.0.1:3210/__test/state'

test.beforeEach(async ({ request }) => {
  await request.post(stateUrl, { data: {} })
})

test('private media cannot reach service credentials or storage, including HEAD requests', async ({ request }) => {
  await request.post(stateUrl, { data: { visible: false } })
  expect((await request.get(filePath)).status()).toBe(404)
  expect((await request.head(filePath)).status()).toBe(404)
  expect((await request.get(`/api/media/${mediaId}`)).status()).toBe(404)
  const state = await (await request.get(stateUrl)).json()
  expect(state.serviceReads).toBe(0)
  expect(state.storageReads).toBe(0)
})

test('published metadata contains a revocable app URL and delivery never redirects to storage', async ({ request }) => {
  const metadata = await request.get(`/api/media/${mediaId}`)
  expect(metadata.status()).toBe(200)
  const body = await metadata.json()
  expect(body.data.url).toBe(filePath)
  expect(JSON.stringify(body)).not.toMatch(/storage_path|signedURL|token=|subject_description|member_ids|original_name/)
  const delivered = await request.get(filePath, { maxRedirects: 0 })
  expect(delivered.status()).toBe(200)
  expect(delivered.headers().location).toBeUndefined()
  expect(delivered.headers()['content-type']).toBe('video/mp4')
  expect(delivered.headers()['cache-control']).toContain('no-store')
  expect(delivered.headers()['cdn-cache-control']).toBe('no-store')
  expect(delivered.headers()['x-content-type-options']).toBe('nosniff')
  expect((await delivered.body()).length).toBe(100)
  await request.post(stateUrl, { data: { visible: false } })
  expect((await request.get(filePath)).status()).toBe(404)
  expect((await request.get(`/api/media/${mediaId}`)).status()).toBe(404)
  const state = await (await request.get(stateUrl)).json()
  expect(state.serviceReads).toBe(0)
  expect(state.storageReads).toBe(0)
})

test('video seeking returns exact ranges and HEAD does not fetch the object', async ({ request }) => {
  const head = await request.head(filePath)
  expect(head.status()).toBe(200)
  expect(head.headers()['content-length']).toBe('100')
  let state = await (await request.get(stateUrl)).json()
  expect(state.serviceReads).toBe(0)
  expect(state.storageReads).toBe(0)
  const range = await request.get(filePath, { headers: { Range: 'bytes=10-19' } })
  expect(range.status()).toBe(206)
  expect(range.headers()['content-range']).toBe('bytes 10-19/100')
  expect([...await range.body()]).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
  const invalid = await request.get(filePath, { headers: { Range: 'bytes=100-' } })
  expect(invalid.status()).toBe(416)
  expect(invalid.headers()['content-range']).toBe('bytes */100')
  state = await (await request.get(stateUrl)).json()
  expect(state.serviceReads).toBe(1)
  expect(state.storageReads).toBe(1)
})

test('a storage server that ignores Range fails closed instead of returning incorrect video bytes', async ({ request }) => {
  await request.post(stateUrl, { data: { ignoreRange: true } })
  const response = await request.get(filePath, { headers: { Range: 'bytes=10-19' } })
  expect(response.status()).toBe(503)
  expect(await response.json()).toEqual({ error: 'Media is temporarily unavailable' })
})

test('private preview requires a verified administrator for both GET and HEAD', async ({ request }) => {
  const path = `/api/admin/media/${mediaId}/file`
  expect((await request.get(path)).status()).toBe(401)
  expect((await request.head(path)).status()).toBe(401)
  const cookie = testSessionCookie()
  const headers = { Cookie: `${cookie.name}=${cookie.value}` }
  await request.post(stateUrl, { data: { admin: false, visible: false } })
  expect((await request.get(path, { headers })).status()).toBe(401)
  expect((await request.head(path, { headers })).status()).toBe(401)
  let state = await (await request.get(stateUrl)).json()
  expect(state.serviceReads).toBe(0)
  expect(state.storageReads).toBe(0)
  await request.post(stateUrl, { data: { admin: true, visible: false } })
  expect((await request.head(path, { headers })).status()).toBe(200)
  const response = await request.get(path, { headers: { ...headers, Range: 'bytes=10-19' }, maxRedirects: 0 })
  expect(response.status()).toBe(206)
  expect(response.headers().location).toBeUndefined()
  expect([...await response.body()]).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
  state = await (await request.get(stateUrl)).json()
  expect(state.serviceReads).toBe(1)
  expect(state.storageReads).toBe(1)
})
