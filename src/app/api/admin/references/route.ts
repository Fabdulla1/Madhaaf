import { z } from 'zod'
import { getAdmin } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'

const uuid = z.string().uuid()
const reference = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('article_categories'), article_id: uuid, category_id: uuid }).strict(),
  z.object({ kind: z.literal('article_sources'), article_id: uuid, source_id: uuid, note: z.string().max(2000).nullable().optional() }).strict(),
  z.object({ kind: z.literal('lexeme_sources'), lexeme_id: uuid, source_id: uuid, note: z.string().max(2000).nullable().optional() }).strict(),
  z.object({ kind: z.literal('member_sources'), member_id: uuid, source_id: uuid, note: z.string().max(2000).nullable().optional() }).strict(),
  z.object({ kind: z.literal('article_lexemes'), article_id: uuid, lexeme_id: uuid }).strict(),
])

const owners = {
  article_categories: 'article_id', article_sources: 'article_id',
  lexeme_sources: 'lexeme_id', member_sources: 'member_id',
  article_lexemes: 'article_id',
} as const

export async function GET(request: Request) {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const url = new URL(request.url)
  const kind = url.searchParams.get('kind') || ''
  const ownerId = url.searchParams.get('owner_id') || ''
  if (!Object.hasOwn(owners,kind) || !uuid.safeParse(ownerId).success) return error('Invalid reference query')
  const table = kind as keyof typeof owners
  const relation = table === 'article_categories' ? ',categories(id,slug,title)'
    : table.endsWith('_sources') ? ',sources(id,title,citation,url)' : ',lexemes(id,headword)'
  const { data, error: dbError } = await admin.supabase.from(table)
    .select(`*${relation}`).eq(owners[table],ownerId).limit(100)
  return dbError ? error('Unable to load references', 500) : json(data)
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  try {
    const { kind, ...payload } = await parseJson(request, reference)
    const { data, error: dbError } = await admin.supabase.from(kind).insert(payload as never).select('*').single()
    if (dbError) return error(dbError.message, dbError.code === '23514' || dbError.code === '23505' ? 409 : 400)
    return json(data, 201)
  } catch (cause) { return requestError(cause) }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  try {
    const input = await parseJson(request, reference)
    const key = input.kind === 'article_categories' ? 'category_id'
      : input.kind === 'article_lexemes' ? 'lexeme_id' : 'source_id'
    const owner = owners[input.kind]
    const { data, error: dbError } = await admin.supabase.from(input.kind).delete()
      .eq(owner,input[owner as keyof typeof input] as string)
      .eq(key,input[key as keyof typeof input] as string).select('*').maybeSingle()
    if (dbError) return error(dbError.message, dbError.code === '23514' ? 409 : 400)
    if (!data) return error('Not found', 404)
    return json({ removed: true })
  } catch (cause) { return requestError(cause) }
}
