import { getAdmin } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'
import { createSchemas, isResource, resourceTables } from '@/lib/server/schemas'

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const { resource } = await context.params
  if (!isResource(resource)) return error('Not found', 404)
  const table = resourceTables[resource]
  const url = new URL(request.url)
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 100, 1), 200)
  let query = admin.supabase.from(table).select('*').limit(limit)
  const parentColumn: Partial<Record<typeof resource, string>> = {
    spellings: 'lexeme_id', senses: 'lexeme_id', examples: 'sense_id',
  }
  const column = parentColumn[resource]
  if (column && url.searchParams.get(column)) query = query.eq(column, url.searchParams.get(column)!)
  if (['members','relationships','lexemes','articles','orthography'].includes(resource) && url.searchParams.get('status')) {
    query = query.eq('status', url.searchParams.get('status')!)
  }
  if (resource === 'members' && url.searchParams.get('q')) {
    query = query.ilike('preferred_name', `%${url.searchParams.get('q')!.slice(0, 100)}%`)
  }
  const { data, error: dbError } = await query
  if (dbError) return error('Unable to load records', 500)
  return json(data)
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const { resource } = await context.params
  if (!isResource(resource)) return error('Not found', 404)
  try {
    const payload = await parseJson(request, createSchemas[resource]) as Record<string, unknown>
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
