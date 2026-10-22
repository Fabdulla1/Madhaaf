export { MEDIA_RULES } from '../media'

export function matchesSignature(bytes: Uint8Array, mime: string) {
  const starts = (...head: number[]) => head.every((b, i) => bytes[i] === b)
  const chars = (offset: number, value: string) => [...value].every((c, i) => bytes[offset+i] === c.charCodeAt(0))
  switch (mime) {
    case 'image/jpeg': return starts(0xff,0xd8,0xff)
    case 'image/png': return starts(0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a)
    case 'image/webp': return chars(0,'RIFF') && chars(8,'WEBP')
    case 'audio/mpeg': return chars(0,'ID3') || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)
    case 'audio/mp4':
    case 'video/mp4': {
      if (bytes.length < 16 || !chars(4, 'ftyp')) return false
      const size = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0)
      if (size < 16 || size > bytes.length || size % 4 !== 0) return false
      const brands = ['isom', 'iso2', 'iso3', 'iso4', 'iso5', 'iso6', 'mp41', 'mp42', 'avc1', 'dash', 'M4V ', 'M4A ', 'M4B ']
      return brands.some(brand => chars(8, brand))
    }
    case 'audio/ogg': return chars(0,'OggS')
    case 'audio/webm':
    case 'video/webm': {
      if (!starts(0x1a,0x45,0xdf,0xa3)) return false
      // Matroska shares the EBML signature; require the WebM document type.
      return bytes.some((value, index) => value === 0x42 && bytes[index + 1] === 0x82 && bytes[index + 2] === 0x84 && chars(index + 3, 'webm'))
    }
    case 'audio/wav': return chars(0,'RIFF') && chars(8,'WAVE')
    default: return false
  }
}

export async function readMediaPrefix(response: Response, limit = 4096): Promise<Uint8Array> {
  if (!response.ok || !response.body) throw new Error('Unable to inspect uploaded file')
  const reader = response.body.getReader()
  const prefix = new Uint8Array(limit)
  let length = 0
  try {
    while (length < limit) {
      const { done, value } = await reader.read()
      if (done) break
      const slice = value.subarray(0, limit - length)
      prefix.set(slice, length)
      length += slice.byteLength
    }
  } finally {
    // Some storage proxies ignore Range. Never buffer the entire video.
    await reader.cancel().catch(() => undefined)
    reader.releaseLock()
  }
  return prefix.subarray(0, length)
}

export async function inspectMediaSignature(url: string, mime: string) {
  const response = await fetch(url, {
    headers: { Range: 'bytes=0-4095' },
    cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15_000),
  })
  return matchesSignature(await readMediaPrefix(response), mime)
}
