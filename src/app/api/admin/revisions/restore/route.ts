import { z } from 'zod'
import { getAdmin } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'
import { hasVersion, isResource, resourceTables } from '@/lib/server/schemas'

const schema = z.object({
  resource: z.string(), id: z.string().uuid(), revision_id: z.number().int().positive(),
  version: z.number().int().positive(),
}).strict()

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  try {
    const args = await parseJson(request, schema)
    if (!isResource(args.resource) || !hasVersion.has(args.resource)) return error('Invalid resource')
    const table = resourceTables[args.resource]
    const { data: revision } = await admin.supabase.from('editorial_revisions').select('old_record')
      .eq('id',args.revision_id).eq('table_name',table).eq('record_id',args.id).maybeSingle()
    if (!revision?.old_record || typeof revision.old_record !== 'object') return error('Revision not found', 404)
    const old = revision.old_record as Record<string, unknown>
    const allowed: Record<string, string[]> = {
      members: ['preferred_name','birth_date_text','death_date_text','living_status','birthplace','places_lived','short_bio','biography','private_notes','portrait_media_id','status','visibility'],
      relationships: ['person_a_id','person_b_id','kind','parent_kind','confidence','note','status'],
      lexemes: ['headword','part_of_speech','usage_note','etymology_note','orthography_version_id','status'],
      articles: ['slug','title','summary','body_markdown','status','published_at'],
      orthography: ['label','title','body_markdown','status'],
    }
    const restored = Object.fromEntries((allowed[args.resource] || []).filter(key => key in old).map(key => [key,old[key]]))
    const { data, error: dbError } = await admin.supabase.from(table).update(restored)
      .eq('id',args.id).eq('version',args.version).select('*').maybeSingle()
    if (dbError) return error(dbError.message, 400)
    if (!data) return error('Record changed since you opened it, or no longer exists', 409)
    return json(data)
  } catch (cause) { return requestError(cause) }
}
