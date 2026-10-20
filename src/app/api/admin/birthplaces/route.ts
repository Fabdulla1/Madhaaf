import { getAdmin } from '@/lib/supabase/server'
import { error } from '@/lib/server/http'

export async function GET(request: Request) {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)

  const page = Number(new URL(request.url).searchParams.get('page') || 1)
  if (!Number.isInteger(page) || page < 1 || page > 10000) return error('Invalid page', 400)
  const limit = 200
  const offset = (page - 1) * limit
  // Fetch only the field needed by the picker, including one lookahead row.
  const { data, error: dbError } = await admin.supabase.from('family_members')
    .select('birthplace').not('birthplace', 'is', null)
    .order('id').range(offset, offset + limit)
  if (dbError) return error('Unable to load saved places', 500)

  const places = (data ?? []).slice(0, limit)
    .map(row => row.birthplace as string).filter(place => place.trim())
  return Response.json({
    data: [...new Set(places)],
    pagination: { hasMore: (data?.length ?? 0) > limit },
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}
