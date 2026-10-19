import { getAdmin } from '@/lib/supabase/server'
import { error, json } from '@/lib/server/http'

export async function GET() {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const [members, relationships] = await Promise.all([
    admin.supabase.from('family_members').select('id,preferred_name,birth_date_text,death_date_text,living_status,short_bio,portrait_media_id,status,visibility').neq('status','archived').limit(2000),
    admin.supabase.from('family_relationships').select('*').neq('status','archived').limit(4000),
  ])
  if (members.error || relationships.error) return error('Unable to load family tree', 500)
  return json({ members: members.data, relationships: relationships.data })
}
