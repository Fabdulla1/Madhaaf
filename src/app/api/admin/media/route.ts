import { getAdmin } from '@/lib/supabase/server'
import { error } from '@/lib/server/http'

export async function GET(request: Request) {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const page = Math.min(Math.max(Number(new URL(request.url).searchParams.get('page')) || 1, 1), 10000)
  const limit = 100
  const offset = (page - 1) * limit
  const { data, error: dbError, count } = await admin.supabase.from('media_assets')
    .select('*', { count: 'exact' }).order('created_at', { ascending: false }).order('id')
    .range(offset, offset + limit - 1)
  if (dbError) return error('Unable to load media', 500)
  return Response.json({ data, pagination: { page, hasMore: offset + (data?.length || 0) < (count || 0) } },
    { headers: { 'Cache-Control': 'private, no-store' } })
}
