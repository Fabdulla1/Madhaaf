import { ZodError, type ZodType, type output } from 'zod'

export function json(data: unknown, status = 200) {
  return Response.json({ data }, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

export function error(message: string, status = 400) {
  return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  // Fetch Metadata still identifies cross-site browser requests when Origin is
  // omitted. CLI clients without browser headers remain subject to auth.
  const fetchSite = request.headers.get('sec-fetch-site')
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return false
  if (!origin) return true
  try { return new URL(origin).origin === new URL(request.url).origin }
  catch { return false }
}

export async function parseJson<S extends ZodType>(request: Request, schema: S): Promise<output<S>> {
  const size = Number(request.headers.get('content-length') || 0)
  if (size > 65536) throw new Error('Request body is too large')
  const reader = request.body?.getReader()
  const chunks: Uint8Array[] = []
  let bytes = 0
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        bytes += value.byteLength
        if (bytes > 65536) {
          await reader.cancel()
          throw new Error('Request body is too large')
        }
        chunks.push(value)
      }
    } finally { reader.releaseLock() }
  }
  const merged = new Uint8Array(bytes)
  let offset = 0
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength }
  const raw = new TextDecoder().decode(merged)
  try { return schema.parse(JSON.parse(raw)) }
  catch (cause) {
    if (cause instanceof ZodError) throw new Error(cause.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '))
    throw new Error('Invalid JSON body')
  }
}

export function requestError(cause: unknown) {
  if (cause instanceof Error && (cause.message.includes('Supabase URL and publishable key') || cause.message === 'Invalid SITE_URL configuration'))
    return error('Service is not configured', 503)
  if (cause instanceof Error && cause.message === 'Request body is too large')
    return error(cause.message, 413)
  return error(cause instanceof Error ? cause.message : 'Invalid request')
}
