import { expect, test } from '@playwright/test'
import { MEDIA_RULES, mediaMetadataPatchSchema, uploadMediaSchema } from '../../src/lib/media'
import { matchesSignature, readMediaPrefix } from '../../src/lib/server/media'
import { parseByteRange } from '../../src/lib/server/media-delivery'

const upload = {
  title: 'Family interview',
  subject_description: 'An oral history interview recorded with a family member.',
  consent_confirmed: true,
  mime_type: 'video/mp4', bytes: 1024, original_name: 'interview.mp4',
}
const personId = '11111111-1111-4111-8111-111111111111'

function mp4Header(brand: string) {
  const bytes = new Uint8Array(24)
  new DataView(bytes.buffer).setUint32(0, 24)
  bytes.set(new TextEncoder().encode(`ftyp${brand}`), 4)
  bytes.set(new TextEncoder().encode('isommp42'), 16)
  return bytes
}

test('upload requires identified content and storage consent before a ticket can be issued', () => {
  expect(uploadMediaSchema.parse({ ...upload, title: '  Interview  ' }).title).toBe('Interview')
  for (const changes of [
    { title: '' }, { title: '   ' }, { subject_description: '' },
    { subject_description: ' \n ' }, { consent_confirmed: false },
    { consent_confirmed: undefined }, { public_approved: true },
  ]) {
    expect(uploadMediaSchema.safeParse({ ...upload, ...changes }).success).toBe(false)
  }
})

test('upload validates selected identities, calendar dates, supported types and actual size limits', () => {
  expect(uploadMediaSchema.safeParse({ ...upload, member_ids: [personId], captured_on: '2024-02-29' }).success).toBe(true)
  for (const changes of [
    { member_ids: ['A name instead of an ID'] }, { member_ids: [personId, personId] },
    { article_id: 'not-a-story-id' }, { article_id: personId, member_ids: [personId] },
    { captured_on: '2025-02-29' }, { captured_on: '0000-01-01' },
    { captured_on: '2026-13-01' }, { bytes: 0 }, { bytes: 1.5 },
    { mime_type: 'image/svg+xml' }, { mime_type: 'text/html' },
    { mime_type: '__proto__' }, { mime_type: 'constructor' },
  ]) {
    expect(uploadMediaSchema.safeParse({ ...upload, ...changes }).success).toBe(false)
  }
  for (const mime_type of ['image/jpeg', 'audio/mpeg', 'video/mp4', 'video/webm']) {
    const max = MEDIA_RULES[mime_type].max
    expect(uploadMediaSchema.safeParse({ ...upload, mime_type, bytes: max }).success).toBe(true)
    expect(uploadMediaSchema.safeParse({ ...upload, mime_type, bytes: max + 1 }).success).toBe(false)
  }
  expect(MEDIA_RULES['video/mp4'].kind).toBe('video')
  expect(MEDIA_RULES['video/webm'].kind).toBe('video')
})

test('metadata edits preserve required context and allow explicit consent revocation', () => {
  expect(mediaMetadataPatchSchema.safeParse({ version: 1, public_approved: false, consent_confirmed: false }).success).toBe(true)
  for (const changes of [{ title: ' ' }, { subject_description: '' }, { version: 0 }, { storage_path: 'other.mp4' }]) {
    expect(mediaMetadataPatchSchema.safeParse({ version: 1, ...changes }).success).toBe(false)
  }
})

test('video headers reject renamed image containers, unrelated EBML and truncated input', () => {
  expect(matchesSignature(mp4Header('isom'), 'video/mp4')).toBe(true)
  expect(matchesSignature(mp4Header('M4A '), 'audio/mp4')).toBe(true)
  // AVIF/HEIC also use ftyp, so its presence alone must not permit a video upload.
  expect(matchesSignature(mp4Header('avif'), 'video/mp4')).toBe(false)
  expect(matchesSignature(mp4Header('heic'), 'video/mp4')).toBe(false)
  const truncated = mp4Header('isom').slice(0, 12)
  expect(matchesSignature(truncated, 'video/mp4')).toBe(false)
  const impossibleSize = mp4Header('isom')
  new DataView(impossibleSize.buffer).setUint32(0, 65536)
  expect(matchesSignature(impossibleSize, 'video/mp4')).toBe(false)
  const webm = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0x87, 0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6d])
  expect(matchesSignature(webm, 'video/webm')).toBe(true)
  expect(matchesSignature(webm, 'audio/webm')).toBe(true)
  expect(matchesSignature(webm.slice(0, 4), 'video/webm')).toBe(false)
  expect(matchesSignature(webm.slice(0, 11), 'video/webm')).toBe(false)
  const matroska = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0x8b, 0x42, 0x82, 0x88, ...new TextEncoder().encode('matroska')])
  expect(matchesSignature(matroska, 'video/webm')).toBe(false)
  expect(matchesSignature(new TextEncoder().encode('<script>alert(1)</script>'), 'video/mp4')).toBe(false)
})

test('inspection stops after its byte budget even when storage ignores Range', async () => {
  let cancelled = false
  const response = new Response(new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new Uint8Array(50_000).fill(7)) },
    cancel() { cancelled = true },
  }))
  const prefix = await readMediaPrefix(response)
  expect(prefix.byteLength).toBe(4096)
  expect(prefix.every(value => value === 7)).toBe(true)
  expect(cancelled).toBe(true)
  await expect(readMediaPrefix(new Response('unavailable', { status: 503 }))).rejects.toThrow('Unable to inspect')
})

test('media ranges support seeking while rejecting malformed or unsatisfiable requests', () => {
  expect(parseByteRange(null, 100)).toBeNull()
  expect(parseByteRange('bytes=0-0', 100)).toEqual({ start: 0, end: 0 })
  expect(parseByteRange('bytes=10-', 100)).toEqual({ start: 10, end: 99 })
  expect(parseByteRange('bytes=-20', 100)).toEqual({ start: 80, end: 99 })
  expect(parseByteRange('bytes=-200', 100)).toEqual({ start: 0, end: 99 })
  expect(parseByteRange('bytes=80-200', 100)).toEqual({ start: 80, end: 99 })
  for (const range of ['bytes=100-', 'bytes=20-10', 'bytes=-0', 'bytes=-', 'bytes=0-1,4-5', 'items=0-1', 'bytes=1e2-', 'bytes=9007199254740992-']) {
    expect(() => parseByteRange(range, 100), range).toThrow('Invalid byte range')
  }
  expect(() => parseByteRange('bytes=0-', 0)).toThrow('Invalid byte range')
})
