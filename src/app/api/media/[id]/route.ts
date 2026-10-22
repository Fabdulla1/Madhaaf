import { z } from 'zod'
import { createPublicClient, supabaseConfigured } from '@/lib/supabase/server'
import { error, json } from '@/lib/server/http'
import { PUBLIC_MEDIA_FIELDS } from '@/lib/server/public-media'

import { connection } from 'next/server'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await connection()
  if (!supabaseConfigured()) return error('Service is not configured', 503)
  const { id } = await context.params
  if (!z.string().uuid().safeParse(id).success) return error('Not found', 404)
  const db = createPublicClient()
  const { data: asset, error: dbError } = await db.from('public_media')
    .select(PUBLIC_MEDIA_FIELDS)
    .eq('id', id).maybeSingle()
  if (dbError || !asset) return error('Not found', 404)
  return json({ ...asset, url: `/api/media/${asset.id}/file` })
}
