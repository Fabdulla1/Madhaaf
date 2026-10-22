import { z } from 'zod'
import { getAdmin } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'
import { mediaMetadataPatchSchema } from '@/lib/media'
import { loadAdminMedia } from '@/lib/server/admin-media'

type Context = { params: Promise<{ id: string }> }
const uuid = z.string().uuid()

export async function GET(_request: Request, context: Context) {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const { id } = await context.params
  if (!uuid.safeParse(id).success) return error('Not found', 404)
  try {
    const data = await loadAdminMedia(admin.supabase, id)
    if (!data) return error('Not found', 404)
    return json({ ...data, url: `/api/admin/media/${id}/file` })
  } catch { return error('Unable to load media details', 500) }
}

export async function PATCH(request: Request, context: Context) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const { id } = await context.params
  if (!uuid.safeParse(id).success) return error('Not found', 404)
  try {
    const payload = await parseJson(request, mediaMetadataPatchSchema)
    const { version, ...changes } = payload
    if (!Object.keys(changes).length) return error('No changes provided')
    const { data: savedId, error: dbError } = await admin.supabase.rpc('update_media_metadata', {
      asset_id: id, expected_version: version, changes,
    })
    if (dbError) {
      if (['40001', 'P0002'].includes(dbError.code)) return error('Record changed since you opened it, or no longer exists. Reopen it and try again.', 409)
      if (dbError.code === '23514') return error('Check the required description and consent. Public approval also needs an article attachment, image alternative text, and no family associations.', 400)
      return error('Unable to save media details', 500)
    }
    if (!savedId) return error('Record changed since you opened it, or no longer exists', 409)
    const data = await loadAdminMedia(admin.supabase, savedId)
    return data ? json(data) : error('Details saved, but could not be loaded. Refresh the library.', 500)
  } catch (cause) { return requestError(cause) }
}
