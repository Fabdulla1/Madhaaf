import { createPublicClient, supabaseConfigured } from '@/lib/supabase/server'
import { error, json } from '@/lib/server/http'

import { connection } from 'next/server'

export async function GET() {
  await connection()
  if (!supabaseConfigured()) return error('Service is not configured', 503)
  const db = createPublicClient()
  const { data, error: dbError } = await db.from('orthography_versions')
    .select('id,label,title,body_markdown').eq('status','published').order('created_at',{ascending:false}).limit(1).maybeSingle()
  return dbError ? error('Unable to load orthography', 500) : json(data)
}
