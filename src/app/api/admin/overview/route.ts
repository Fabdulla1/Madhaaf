import { getAdmin } from '@/lib/supabase/server'
import { error, json } from '@/lib/server/http'

export async function GET() {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const tables = ['family_members','lexemes','articles'] as const
  const counts = await Promise.all(tables.flatMap(table => ['draft','review','published'].map(async status => {
    const result = await admin.supabase.from(table).select('*', { count: 'exact', head: true }).eq('status', status)
    return { table, status, count: result.count || 0, error: result.error }
  })))
  if (counts.some(c => c.error)) return error('Unable to load overview', 500)
  const recent = await Promise.all(tables.map(async table => {
    const result = await admin.supabase.from(table).select('id,updated_at,status').order('updated_at',{ascending:false}).limit(5)
    return { table, records: result.data || [] }
  }))
  const { data: activity } = await admin.supabase.from('audit_events').select('id,table_name,record_id,operation,occurred_at').order('occurred_at',{ascending:false}).limit(20)
  return json({ counts, recent, activity: activity || [] })
}
