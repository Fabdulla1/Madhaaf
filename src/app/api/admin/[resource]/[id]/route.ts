import { getAdmin } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'
import { hasVersion, isResource, patchSchemas, resourceTables } from '@/lib/server/schemas'
import { z } from 'zod'

type Context = { params: Promise<{ resource: string; id: string }> }
const uuid = z.string().uuid()

export async function GET(_request: Request, context: Context) {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const { resource, id } = await context.params
  if (!isResource(resource) || !uuid.safeParse(id).success) return error('Not found', 404)
  const { data, error: dbError } = await admin.supabase.from(resourceTables[resource]).select('*').eq('id', id).maybeSingle()
  if (dbError) return error('Unable to load record', 500)
  if (!data) return error('Not found', 404)
  return json(data)
}

export async function PATCH(request: Request, context: Context) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const { resource, id } = await context.params
  if (!isResource(resource) || !uuid.safeParse(id).success) return error('Not found', 404)
  try {
    const payload = await parseJson(request, patchSchemas[resource]) as Record<string, unknown>
    const expectedVersion = payload.version
    delete payload.version
    if (!Object.keys(payload).length) return error('No changes provided')
    // Endpoint direction is fixed after creation. Replacing a relationship is
    // a new editorial decision and must use a new row.
    if (resource === 'relationships' && ['person_a_id','person_b_id','kind'].some(k => k in payload))
      return error('Create a new relationship to change endpoints or kind')
    if (resource === 'inflections' && 'lexeme_id' in payload)
      return error('Create a new inflected form to change its dictionary entry')
    if (resource === 'articles' && payload.status === 'published') payload.published_at = new Date().toISOString()
    if (['members','lexemes','articles'].includes(resource)) payload.updated_by = admin.user.id
    let query = admin.supabase.from(resourceTables[resource]).update(payload).eq('id', id)
    if (hasVersion.has(resource)) query = query.eq('version', expectedVersion as number)
    const { data, error: dbError } = await query.select('*').maybeSingle()
    if (dbError) return error(dbError.message, dbError.code === '23505' || dbError.code === '23514' ? 409 : 400)
    if (!data) return error(hasVersion.has(resource) ? 'Record changed since you opened it, or no longer exists' : 'Not found', hasVersion.has(resource) ? 409 : 404)
    return json(data)
  } catch (cause) { return requestError(cause) }
}

export async function DELETE(request: Request, context: Context) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const { resource, id } = await context.params
  if (!isResource(resource) || !uuid.safeParse(id).success) return error('Not found', 404)
  if (resource === 'spellings' || resource === 'senses' || resource === 'examples' || resource === 'inflections') {
    if (resource === 'spellings') {
      const { data: form } = await admin.supabase.from('word_forms').select('is_preferred').eq('id',id).maybeSingle()
      if (!form) return error('Not found', 404)
      if (form.is_preferred) return error('Choose another preferred spelling before removing this one', 409)
    }
    if (resource === 'senses') {
      const { count } = await admin.supabase.from('examples').select('*',{count:'exact',head:true}).eq('sense_id',id)
      if (count) return error('Remove this meaning’s examples first', 409)
    }
    const { data, error: dbError } = await admin.supabase.from(resourceTables[resource]).delete().eq('id',id).select('id').maybeSingle()
    if (dbError) return error(dbError.message, dbError.code === '23514' ? 409 : 400)
    if (!data) return error('Not found', 404)
    return json({ removed: true })
  }
  if (!hasVersion.has(resource)) return error('Delete is unavailable for this resource', 405)
  try {
    const { version } = await parseJson(request, z.object({ version: z.number().int().positive() }).strict())
    const { data, error: dbError } = await admin.supabase.from(resourceTables[resource])
      .update({ status: 'archived' }).eq('id', id).eq('version', version).select('*').maybeSingle()
    if (dbError) return error('Unable to archive record', 400)
    if (!data) return error('Record changed since you opened it, or no longer exists', 409)
    return json(data)
  } catch (cause) { return requestError(cause) }
}
