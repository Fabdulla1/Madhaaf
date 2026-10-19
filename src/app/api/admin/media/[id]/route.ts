import { z } from 'zod'
import { getAdmin } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'

type Context = { params: Promise<{ id: string }> }
const uuid = z.string().uuid()

export async function GET(_request: Request, context: Context) {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const { id } = await context.params
  if (!uuid.safeParse(id).success) return error('Not found', 404)
  const { data, error: dbError } = await admin.supabase.from('media_assets').select('*').eq('id',id).maybeSingle()
  if (dbError || !data) return error('Not found', 404)
  const { data: signed } = await admin.supabase.storage.from('heritage-media').createSignedUrl(data.storage_path, 300)
  return json({ ...data, url: signed?.signedUrl || null })
}

export async function PATCH(request: Request, context: Context) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const { id } = await context.params
  if (!uuid.safeParse(id).success) return error('Not found', 404)
  try {
    const payload = await parseJson(request, z.object({
      version: z.number().int().positive(),
      alt_text: z.string().max(500).nullable().optional(),
      caption: z.string().max(2000).nullable().optional(),
      speaker_name: z.string().max(200).nullable().optional(),
      attribution: z.string().max(1000).nullable().optional(),
      consent_confirmed: z.boolean().optional(),
      public_approved: z.boolean().optional(),
    }).strict())
    const { version, ...changes } = payload
    if (!Object.keys(changes).length) return error('No changes provided')
    const { data, error: dbError } = await admin.supabase.from('media_assets').update(changes).eq('id',id).eq('version',version).select('*').maybeSingle()
    if (dbError) return error(dbError.message, 400)
    if (!data) return error('Record changed since you opened it, or no longer exists', 409)
    return json(data)
  } catch (cause) { return requestError(cause) }
}
