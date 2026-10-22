import { z } from 'zod'
import { getAdmin } from '@/lib/supabase/server'
import { error } from '@/lib/server/http'
import { streamMedia } from '@/lib/server/media-stream'
import { MEDIA_RULES } from '@/lib/server/media'

type Context = { params: Promise<{ id: string }> }

async function deliver(request: Request, context: Context) {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const { id } = await context.params
  if (!z.string().uuid().safeParse(id).success) return error('Not found', 404)
  const { data: asset, error: dbError } = await admin.supabase.from('media_assets')
    .select('id,mime_type,bytes').eq('id', id).maybeSingle()
  if (dbError || !asset || !MEDIA_RULES[asset.mime_type]) return error('Not found', 404)
  return streamMedia(request, asset)
}

export const GET = deliver
export const HEAD = deliver
