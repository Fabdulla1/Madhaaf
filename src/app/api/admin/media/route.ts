import { getAdmin } from '@/lib/supabase/server'
import { error, json } from '@/lib/server/http'

export async function GET() {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const { data, error: dbError } = await admin.supabase.from('media_assets').select('*').order('created_at',{ascending:false}).limit(100)
  return dbError ? error('Unable to load media', 500) : json(data)
}
