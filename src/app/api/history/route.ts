import { createPublicClient, supabaseConfigured } from '@/lib/supabase/server'
import { error, json } from '@/lib/server/http'

import { connection } from 'next/server'

export async function GET(request: Request) {
  await connection()
  if (!supabaseConfigured()) return error('Service is not configured', 503)
  const db = createPublicClient()
  const category = new URL(request.url).searchParams.get('category')?.slice(0, 100)
  if (category) {
    const { data: cat } = await db.from('categories').select('id').eq('slug', category).maybeSingle()
    if (!cat) return json([])
    const { data: links, error: linkError } = await db.from('article_categories').select('article_id').eq('category_id', cat.id).limit(100)
    if (linkError) return error('Unable to load articles', 500)
    const ids = (links || []).map(x => x.article_id)
    if (!ids.length) return json([])
    const { data, error: dbError } = await db.from('articles').select('id,slug,title,summary,published_at').eq('status','published').in('id', ids).order('published_at',{ascending:false})
    return dbError ? error('Unable to load articles', 500) : json(data)
  }
  const { data, error: dbError } = await db.from('articles').select('id,slug,title,summary,published_at').eq('status','published').order('published_at',{ascending:false}).limit(100)
  return dbError ? error('Unable to load articles', 500) : json(data)
}
