import { getAdmin } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'
import { createSchemas, isResource, resourceTables } from '@/lib/server/schemas'
import { duplicateConfirmationSchema, requireDuplicateReview } from '@/lib/server/duplicate-review'
import type { DuplicateConfirmation } from '@/lib/duplicate-matching'

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const { resource } = await context.params
  if (!isResource(resource)) return error('Not found', 404)
  const table = resourceTables[resource]
  const url = new URL(request.url)
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 100, 1), 200)
  const page = Math.min(Math.max(Number(url.searchParams.get('page')) || 1, 1), 10000)
  const offset = (page-1)*limit
  let query = admin.supabase.from(table).select('*',{count:'exact'}).order('id').range(offset,offset+limit-1)
  const parentColumn: Partial<Record<typeof resource, string>> = {
    spellings: 'lexeme_id', senses: 'lexeme_id', examples: 'sense_id', inflections: 'lexeme_id',
  }
  const column = parentColumn[resource]
  if (column && url.searchParams.get(column)) query = query.eq(column, url.searchParams.get(column)!)
  if (['members','relationships','lexemes','articles','orthography'].includes(resource) && url.searchParams.get('status')) {
    query = query.eq('status', url.searchParams.get('status')!)
  }
  const searchColumn: Partial<Record<typeof resource, string>> = {
    members: 'preferred_name', lexemes: 'headword', articles: 'title',
    categories: 'title', orthography: 'title', sources: 'title',
  }
  const q = url.searchParams.get('q')?.trim().slice(0,100)
  if (q && searchColumn[resource]) query = query.ilike(searchColumn[resource], `%${q}%`)
  const { data, error: dbError, count } = await query
  if (dbError) return error('Unable to load records', 500)
  return Response.json({ data, pagination: {
    page, limit, total: count || 0, hasMore: offset+(data?.length || 0) < (count || 0),
  } }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const { resource } = await context.params
  if (!isResource(resource)) return error('Not found', 404)
  try {
    const schema = resource === 'members' || resource === 'lexemes'
      ? createSchemas[resource].extend({ duplicate_confirmation: duplicateConfirmationSchema.optional() })
      : createSchemas[resource]
    const payload = await parseJson(request, schema) as Record<string, unknown>
    if (resource === 'members' || resource === 'lexemes') {
      const confirmation = payload.duplicate_confirmation as DuplicateConfirmation | undefined
      delete payload.duplicate_confirmation
      const review = await requireDuplicateReview(admin.supabase, resource === 'members' ? 'people' : 'dictionary', String(payload[resource === 'members' ? 'preferred_name' : 'headword']), confirmation, request.signal)
      if (review) return review
    }
    if (resource === 'relationships' && payload.kind === 'partner' &&
      String(payload.person_a_id) > String(payload.person_b_id)) {
      [payload.person_a_id, payload.person_b_id] = [payload.person_b_id, payload.person_a_id]
    }
    if (resource === 'articles' && payload.status === 'published' && !payload.published_at) payload.published_at = new Date().toISOString()
    if (['members','lexemes','articles'].includes(resource)) payload.created_by = admin.user.id
    const { data, error: dbError } = await admin.supabase.from(resourceTables[resource]).insert(payload).select('*').single()
    if (dbError) return error(dbError.message, dbError.code === '23505' || dbError.code === '23514' ? 409 : 400)
    return json(data, 201)
  } catch (cause) { return requestError(cause) }
}
