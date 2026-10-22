import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

export const PUBLIC_MEDIA_FIELDS = 'id,kind,mime_type,bytes,alt_text,caption,speaker_name,attribution'

export async function publicMediaByIds(db: SupabaseClient, ids: string[]) {
  if (!ids.length) return []
  const { data, error } = await db.from('public_media').select(PUBLIC_MEDIA_FIELDS).in('id', [...new Set(ids)])
  if (error) throw new Error('Unable to load published media')
  return (data || []).map(asset => ({ ...asset, url: `/api/media/${asset.id}/file` }))
}
