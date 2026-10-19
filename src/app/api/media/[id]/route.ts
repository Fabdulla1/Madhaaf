import { z } from 'zod'
import { createPublicClient, supabaseConfigured } from '@/lib/supabase/server'
import { error, json } from '@/lib/server/http'

import { connection } from 'next/server'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await connection()
  if (!supabaseConfigured()) return error('Service is not configured', 503)
  const { id } = await context.params
  if (!z.string().uuid().safeParse(id).success) return error('Not found', 404)
  const db = createPublicClient()
  // RLS exposes metadata only when approved and linked to a published article
  // or dictionary entry. Family media has no public route through this policy.
  const { data: asset, error: dbError } = await db.from('media_assets')
    .select('id,kind,storage_path,alt_text,caption,speaker_name,attribution')
    .eq('id', id).maybeSingle()
  if (dbError || !asset) return error('Not found', 404)
  const { data: signed, error: signError } = await db.storage.from('heritage-media').createSignedUrl(asset.storage_path, 300)
  if (signError || !signed) return error('Unable to load media', 500)
  return json({ id: asset.id, kind: asset.kind, alt_text: asset.alt_text,
    caption: asset.caption, speaker_name: asset.speaker_name,
    attribution: asset.attribution, url: signed.signedUrl })
}
