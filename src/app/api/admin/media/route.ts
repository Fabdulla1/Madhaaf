import { getAdmin } from '@/lib/supabase/server'
import { error } from '@/lib/server/http'
import { ADMIN_MEDIA_FIELDS, presentAdminMedia } from '@/lib/server/admin-media'

export async function GET(request: Request) {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const page = Math.min(Math.max(Number.parseInt(new URL(request.url).searchParams.get('page') || '1', 10) || 1, 1), 10000)
  const limit = 100
  const offset = (page - 1) * limit
  const { data, error: dbError, count } = await admin.supabase.from('media_assets')
    .select(ADMIN_MEDIA_FIELDS, { count: 'exact' }).order('created_at', { ascending: false }).order('id')
    .range(offset, offset + limit - 1)
  if (dbError) return error('Unable to load media', 500)
  try {
    const items = await presentAdminMedia(admin.supabase, data || [])
    return Response.json({ data: items, pagination: { page, hasMore: offset + items.length < (count || 0) } },
      { headers: { 'Cache-Control': 'private, no-store' } })
  } catch { return error('Unable to load media publication status', 500) }
}
