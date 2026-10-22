import { z } from 'zod'

export type MediaKind = 'image' | 'audio' | 'video'

export const MEDIA_RULES: Record<string, { ext: string; kind: MediaKind; max: number }> = {
  'image/jpeg': { ext: 'jpg', kind: 'image', max: 10_000_000 },
  'image/png': { ext: 'png', kind: 'image', max: 10_000_000 },
  'image/webp': { ext: 'webp', kind: 'image', max: 10_000_000 },
  'audio/mpeg': { ext: 'mp3', kind: 'audio', max: 25_000_000 },
  'audio/mp4': { ext: 'm4a', kind: 'audio', max: 25_000_000 },
  'audio/ogg': { ext: 'ogg', kind: 'audio', max: 25_000_000 },
  'audio/webm': { ext: 'webm', kind: 'audio', max: 25_000_000 },
  'audio/wav': { ext: 'wav', kind: 'audio', max: 25_000_000 },
  'video/mp4': { ext: 'mp4', kind: 'video', max: 50_000_000 },
  'video/webm': { ext: 'webm', kind: 'video', max: 50_000_000 },
}

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional()
const capturedOn = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a date in YYYY-MM-DD format')
  .refine(value => {
    const date = new Date(`${value}T00:00:00Z`)
    return Number(value.slice(0, 4)) > 0 && Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  }, 'Enter a valid calendar date').nullable().optional()

export const mediaMetadataSchema = z.object({
  title: z.string().trim().min(1, 'Add a title').max(200),
  subject_description: z.string().trim().min(1, 'Describe who or what is recorded').max(2000),
  captured_on: capturedOn,
  location: optionalText(300),
  alt_text: optionalText(500),
  caption: optionalText(2000),
  speaker_name: optionalText(200),
  attribution: optionalText(1000),
  consent_confirmed: z.boolean(),
}).strict()

export const uploadMediaSchema = mediaMetadataSchema.extend({
  consent_confirmed: z.literal(true, { error: 'Confirm permission to store this file before uploading' }),
  member_ids: z.array(z.string().uuid()).max(20).default([])
    .refine(ids => new Set(ids).size === ids.length, 'Choose each person only once'),
  article_id: z.string().uuid().nullable().optional(),
  mime_type: z.string().max(100),
  bytes: z.number().int().positive(),
  original_name: z.string().trim().min(1).max(255),
}).strict().superRefine((input, context) => {
  if (input.article_id && input.member_ids.length) {
    context.addIssue({ code: 'custom', path: ['article_id'], message: 'Family media stays private. Choose people or an article for this upload.' })
  }
  const rule = Object.hasOwn(MEDIA_RULES, input.mime_type) ? MEDIA_RULES[input.mime_type] : null
  if (!rule) context.addIssue({ code: 'custom', path: ['mime_type'], message: 'Unsupported file type' })
  else if (input.bytes > rule.max) context.addIssue({ code: 'custom', path: ['bytes'], message: `This file exceeds the ${rule.max / 1_000_000} MB limit` })
})

export const mediaMetadataPatchSchema = mediaMetadataSchema.partial().extend({
  version: z.number().int().positive(),
  public_approved: z.boolean().optional(),
}).strict()
