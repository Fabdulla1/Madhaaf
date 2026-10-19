import { z } from 'zod'
import { getAdmin } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'

const association = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('member_media'), member_id: z.string().uuid(), media_id: z.string().uuid(), note: z.string().max(2000).nullable().optional() }).strict(),
  z.object({ kind: z.literal('lexeme_media'), lexeme_id: z.string().uuid(), media_id: z.string().uuid(), purpose: z.enum(['pronunciation','other']) }).strict(),
  z.object({ kind: z.literal('example_media'), example_id: z.string().uuid(), media_id: z.string().uuid() }).strict(),
  z.object({ kind: z.literal('article_media'), article_id: z.string().uuid(), media_id: z.string().uuid(), display_order: z.number().int().min(0).optional() }).strict(),
])

const owners = {
  member_media: 'member_id', lexeme_media: 'lexeme_id',
  example_media: 'example_id', article_media: 'article_id',
} as const

export async function GET(request: Request) {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const url = new URL(request.url)
  const kind = url.searchParams.get('kind') || ''
  const ownerId = url.searchParams.get('owner_id') || ''
  if (!Object.hasOwn(owners, kind) || !z.string().uuid().safeParse(ownerId).success) return error('Invalid association')
  const table = kind as keyof typeof owners
  const { data, error: dbError } = await admin.supabase.from(table)
    .select('*,media_assets(id,kind,original_name,alt_text,caption,speaker_name,attribution)')
    .eq(owners[table], ownerId).limit(100)
  return dbError ? error('Unable to load attachments', 500) : json(data)
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  try {
    const parsed = await parseJson(request, association)
    const { kind, ...payload } = parsed
    const { data, error: dbError } = await admin.supabase.from(kind).insert(payload as never).select('*').single()
    if (dbError) return error(dbError.message, dbError.code === '23514' ? 409 : 400)
    return json(data, 201)
  } catch (cause) { return requestError(cause) }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  try {
    const parsed = await parseJson(request, association)
    const { kind, media_id } = parsed
    const owner = kind === 'member_media' ? { column: 'member_id', id: parsed.member_id }
      : kind === 'lexeme_media' ? { column: 'lexeme_id', id: parsed.lexeme_id }
      : kind === 'example_media' ? { column: 'example_id', id: parsed.example_id }
      : { column: 'article_id', id: parsed.article_id }
    const { error: dbError } = await admin.supabase.from(kind).delete().eq(owner.column, owner.id).eq('media_id',media_id)
    if (dbError) return error(dbError.message, dbError.code === '23514' ? 409 : 400)
    return json({ removed: true })
  } catch (cause) { return requestError(cause) }
}
