import { createPublicClient, supabaseConfigured } from '@/lib/supabase/server'
import { error } from '@/lib/server/http'

export async function GET() {
  if (!supabaseConfigured()) return error('Service is not configured', 503)
  const { data, error: dbError } = await createPublicClient().rpc('get_public_family_tree')
  if (dbError) return error('Unable to load public family tree', 500)
  return Response.json({ data }, { headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' } })
}
