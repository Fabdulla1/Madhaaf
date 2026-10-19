export const MEDIA_RULES: Record<string, { ext: string; kind: 'image' | 'audio'; max: number }> = {
  'image/jpeg': { ext: 'jpg', kind: 'image', max: 10_000_000 },
  'image/png': { ext: 'png', kind: 'image', max: 10_000_000 },
  'image/webp': { ext: 'webp', kind: 'image', max: 10_000_000 },
  'audio/mpeg': { ext: 'mp3', kind: 'audio', max: 25_000_000 },
  'audio/mp4': { ext: 'm4a', kind: 'audio', max: 25_000_000 },
  'audio/ogg': { ext: 'ogg', kind: 'audio', max: 25_000_000 },
  'audio/webm': { ext: 'webm', kind: 'audio', max: 25_000_000 },
  'audio/wav': { ext: 'wav', kind: 'audio', max: 25_000_000 },
}

export function matchesSignature(bytes: Uint8Array, mime: string) {
  const starts = (...head: number[]) => head.every((b, i) => bytes[i] === b)
  const chars = (offset: number, value: string) => [...value].every((c, i) => bytes[offset+i] === c.charCodeAt(0))
  switch (mime) {
    case 'image/jpeg': return starts(0xff,0xd8,0xff)
    case 'image/png': return starts(0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a)
    case 'image/webp': return chars(0,'RIFF') && chars(8,'WEBP')
    case 'audio/mpeg': return chars(0,'ID3') || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)
    case 'audio/mp4': return chars(4,'ftyp')
    case 'audio/ogg': return chars(0,'OggS')
    case 'audio/webm': return starts(0x1a,0x45,0xdf,0xa3)
    case 'audio/wav': return chars(0,'RIFF') && chars(8,'WAVE')
    default: return false
  }
}
