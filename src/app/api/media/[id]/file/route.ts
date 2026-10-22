import { connection } from 'next/server'
import { z } from 'zod'
import { createPublicClient, supabaseConfigured } from '@/lib/supabase/server'
import { error } from '@/lib/server/http'
import { streamMedia } from '@/lib/server/media-stream'
import { MEDIA_RULES } from '@/lib/server/media'

type Context = { params: Promise<{ id: string }> }

async function deliver(request: Request, context: Context) {
  await connection()
  if (!supabaseConfigured()) return error('Service is not configured', 503)
  const { id } = await context.params
  if (!z.string().uuid().safeParse(id).success) return error('Not found', 404)
  const db = createPublicClient()
  // The projection checks approval, published article use, and family exclusions
  // on every request. Storage tokens and private metadata never leave the server.
  const { data: asset, error: dbError } = await db.from('public_media')
    .select('id,mime_type,bytes').eq('id', id).maybeSingle()
  if (dbError) return error('Unable to load published media', 503)
  if (!asset || !MEDIA_RULES[asset.mime_type]) return error('Not found', 404)
  return streamMedia(request, asset)
}

export const GET = deliver
export const HEAD = deliver
