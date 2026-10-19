import { z } from 'zod'
import { getAdmin } from '@/lib/supabase/server'
import { error, json } from '@/lib/server/http'
import { isResource, resourceTables } from '@/lib/server/schemas'

export async function GET(request: Request) {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const url = new URL(request.url)
  const resource = url.searchParams.get('resource') || ''
  const id = url.searchParams.get('id') || ''
  if (!isResource(resource) || !z.string().uuid().safeParse(id).success) return error('Invalid resource or record')
  const { data, error: dbError } = await admin.supabase.from('editorial_revisions')
    .select('id,old_record,changed_by,changed_at').eq('table_name',resourceTables[resource]).eq('record_id',id)
    .order('changed_at',{ascending:false}).limit(50)
  return dbError ? error('Unable to load revisions', 500) : json(data)
}
