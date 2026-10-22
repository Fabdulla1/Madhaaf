import type { SupabaseClient } from '@supabase/supabase-js'

export const ADMIN_MEDIA_FIELDS = '*,media_details(title,subject_description,captured_on,location),member_media(member_id,family_members(id,preferred_name,living_status)),article_media(article_id,articles(id,title,status)),portrait_users:family_members!family_members_portrait_media_id_fkey(id)'

type Details = { title: string; subject_description: string; captured_on: string | null; location: string | null }
type MediaRow = Record<string, unknown> & {
  id: string
  media_details: Details | Details[] | null
  member_media: { member_id: string; family_members: { id: string; preferred_name: string; living_status: string } | null }[]
  article_media: { article_id: string; articles: { id: string; title: string; status: string } | null }[]
  portrait_users: { id: string }[]
}

export async function presentAdminMedia(db: SupabaseClient, records: unknown[]) {
  const rows = records as MediaRow[]
  if (!rows.length) return []
  const { data: publicRows, error } = await db.from('public_media').select('id').in('id', rows.map(row => row.id))
  if (error) throw new Error('Unable to check media publication status')
  const publicIds = new Set((publicRows || []).map(row => row.id))
  return rows.map(row => {
    const { media_details, portrait_users, ...asset } = row
    delete asset.storage_path
    const details = Array.isArray(media_details) ? media_details[0] : media_details
    return {
      ...asset,
      title: details?.title || '', subject_description: details?.subject_description || '',
      captured_on: details?.captured_on || null, location: details?.location || null,
      member_ids: (row.member_media || []).map(link => link.member_id),
      article_ids: (row.article_media || []).map(link => link.article_id),
      is_family_media: Boolean(row.member_media?.length || portrait_users?.length),
      is_public: publicIds.has(row.id),
    }
  })
}

export async function loadAdminMedia(db: SupabaseClient, id: string) {
  const { data, error } = await db.from('media_assets').select(ADMIN_MEDIA_FIELDS).eq('id', id).maybeSingle()
  if (error) throw new Error('Unable to load media details')
  return data ? (await presentAdminMedia(db, [data]))[0] : null
}
