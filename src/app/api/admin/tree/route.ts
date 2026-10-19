import { getAdmin } from '@/lib/supabase/server'
import { error, json } from '@/lib/server/http'

export async function GET(request: Request) {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const url = new URL(request.url)
  const memberPage = Math.min(Math.max(Number(url.searchParams.get('memberPage')) || 1,1),10000)
  const relationshipPage = Math.min(Math.max(Number(url.searchParams.get('relationshipPage')) || 1,1),10000)
  const memberOffset = (memberPage-1)*1000
  const relationshipOffset = (relationshipPage-1)*1000
  const [members, relationships] = await Promise.all([
    admin.supabase.from('family_members').select('id,preferred_name,birth_date_text,death_date_text,living_status,short_bio,portrait_media_id,status,visibility',{count:'exact'}).neq('status','archived').order('id').range(memberOffset,memberOffset+999),
    admin.supabase.from('family_relationships').select('*',{count:'exact'}).neq('status','archived').order('id').range(relationshipOffset,relationshipOffset+999),
  ])
  if (members.error || relationships.error) return error('Unable to load family tree', 500)
  return json({ members: members.data, relationships: relationships.data,
    pagination: {
      members: { page: memberPage, total: members.count || 0, hasMore: memberOffset+(members.data?.length || 0)<(members.count || 0) },
      relationships: { page: relationshipPage, total: relationships.count || 0, hasMore: relationshipOffset+(relationships.data?.length || 0)<(relationships.count || 0) },
    },
  })
}
