/** A single byte range is enough for browser audio/video seeking. */
export function parseByteRange(header: string | null, size: number): { start: number; end: number } | null {
  if (header === null) return null
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(size) || size < 1)
    throw new Error('Invalid byte range')
  if (!match[1]) {
    const suffix = Number(match[2])
    if (!Number.isSafeInteger(suffix) || suffix <= 0) throw new Error('Invalid byte range')
    return { start: Math.max(0, size - suffix), end: size - 1 }
  }
  const start = Number(match[1])
  const requestedEnd = match[2] ? Number(match[2]) : size - 1
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(requestedEnd) || start >= size || requestedEnd < start)
    throw new Error('Invalid byte range')
  return { start, end: Math.min(requestedEnd, size - 1) }
}
