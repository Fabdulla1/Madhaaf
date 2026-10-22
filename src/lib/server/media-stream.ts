import 'server-only'

import { createServiceClient } from '@/lib/supabase/server'
import { error } from '@/lib/server/http'
import { parseByteRange } from '@/lib/server/media-delivery'

// Call only after checking public eligibility or authenticating an administrator.
export async function streamMedia(request: Request, asset: { id: string; mime_type: string; bytes: number | string }) {
  const size = Number(asset.bytes)
  let range
  try { range = parseByteRange(request.headers.get('range'), size) }
  catch {
    return new Response(null, { status: 416, headers: {
      'Content-Range': `bytes */${size}`, 'Cache-Control': 'private, no-store',
    } })
  }
  const length = range ? range.end - range.start + 1 : size
  const headers = new Headers({
    'Content-Type': asset.mime_type,
    'Content-Length': String(length),
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, no-store, max-age=0',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Disposition': 'inline',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Referrer-Policy': 'no-referrer',
  })
  if (range) headers.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`)
  if (request.method === 'HEAD') return new Response(null, { status: range ? 206 : 200, headers })
  try {
    const service = createServiceClient()
    const { data: object, error: objectError } = await service.from('media_assets')
      .select('storage_path').eq('id', asset.id).maybeSingle()
    if (objectError || !object) return error('Not found', 404)
    const { data: signed, error: signError } = await service.storage.from('heritage-media')
      .createSignedUrl(object.storage_path, 60)
    if (signError || !signed) return error('Media is temporarily unavailable', 503)
    const upstream = await fetch(signed.signedUrl, {
      headers: range ? { Range: `bytes=${range.start}-${range.end}` } : {},
      cache: 'no-store', redirect: 'error', signal: request.signal,
    })
    const expectedStatus = range ? 206 : 200
    if (upstream.status !== expectedStatus || !upstream.body
      || (range && upstream.headers.get('content-range') !== headers.get('Content-Range'))
      || (upstream.headers.has('content-length') && Number(upstream.headers.get('content-length')) !== length)) {
      await upstream.body?.cancel()
      return error('Media is temporarily unavailable', 503)
    }
    return new Response(upstream.body, { status: expectedStatus, headers })
  } catch {
    return error('Media is temporarily unavailable', 503)
  }
}
