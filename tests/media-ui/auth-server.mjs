// Local Supabase fixture. Real database authorization is tested separately in SQL.
import { createServer } from 'node:http'

if (process.env.MADHAAF_MEDIA_TEST_AUTH !== '1') throw new Error('Test fixture only')

const mediaId = '33333333-3333-4333-8333-333333333333'
const user = {
  id: '11111111-1111-4111-8111-111111111111',
  aud: 'authenticated', role: 'authenticated', email: 'media-editor@example.test',
  app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z',
}
let state = { visible: true, admin: true, ignoreRange: false, serviceReads: 0, storageReads: 0 }
const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1:3210')
  const path = url.pathname
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Cache-Control', 'no-store')
  if (path === '/health') return response.end('{}')
  if (path === '/__test/state') {
    if (request.method === 'POST') {
      let body = ''
      for await (const chunk of request) body += chunk
      state = { visible: true, admin: true, ignoreRange: false, serviceReads: 0, storageReads: 0, ...JSON.parse(body) }
    }
    return response.end(JSON.stringify(state))
  }
  if (path === '/storage/v1/object/sign/heritage-media/interview.mp4' && request.method === 'GET') {
    state.storageReads++
    const bytes = Buffer.from(Array.from({ length: 100 }, (_, i) => i))
    const range = /^bytes=(\d+)-(\d+)$/.exec(request.headers.range || '')
    response.setHeader('Content-Type', 'video/mp4')
    if (range && !state.ignoreRange) {
      const start = Number(range[1]); const end = Number(range[2])
      response.statusCode = 206
      response.setHeader('Content-Range', `bytes ${start}-${end}/100`)
      response.setHeader('Content-Length', end - start + 1)
      return response.end(bytes.subarray(start, end + 1))
    }
    response.setHeader('Content-Length', bytes.length)
    return response.end(bytes)
  }
  if (!request.headers.authorization?.startsWith('Bearer ')) {
    response.statusCode = 401
    return response.end(JSON.stringify({ message: 'Missing test session' }))
  }
  if (path === '/auth/v1/user') return response.end(JSON.stringify(user))
  if (path === '/rest/v1/app_users') return response.end(JSON.stringify(state.admin ? [{ role: 'admin' }] : []))
  if (path === '/rest/v1/public_media') {
    return response.end(JSON.stringify(state.visible && url.searchParams.get('id') === `eq.${mediaId}` ? [{
      id: mediaId, kind: 'video', mime_type: 'video/mp4', bytes: 100,
      alt_text: null, caption: 'Published oral history', speaker_name: null, attribution: 'Contributor',
    }] : []))
  }
  const service = request.headers.authorization === 'Bearer test-only-service-key'
  if (path === '/rest/v1/media_assets' && !service && state.admin) {
    return response.end(JSON.stringify([{ id: mediaId, mime_type: 'video/mp4', bytes: 100 }]))
  }
  if (!service) {
    response.statusCode = 403
    return response.end(JSON.stringify({ message: 'Private storage requires the server credential' }))
  }
  if (path === '/rest/v1/media_assets') {
    state.serviceReads++
    return response.end(JSON.stringify([{ storage_path: 'interview.mp4' }]))
  }
  if (path === '/storage/v1/object/sign/heritage-media/interview.mp4' && request.method === 'POST') {
    return response.end(JSON.stringify({ signedURL: '/object/sign/heritage-media/interview.mp4?token=test-signed-token' }))
  }
  response.statusCode = 404
  response.end(JSON.stringify({ message: `Unexpected fixture request: ${path}` }))
})
server.listen(3210, '127.0.0.1')
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close())
