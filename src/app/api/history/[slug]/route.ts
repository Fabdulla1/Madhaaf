import { createPublicClient, supabaseConfigured } from '@/lib/supabase/server'
import { error, json } from '@/lib/server/http'
import { publicMediaByIds } from '@/lib/server/public-media'

import { connection } from 'next/server'

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  await connection()
  if (!supabaseConfigured()) return error('Service is not configured', 503)
  const { slug } = await context.params
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return error('Not found', 404)
  const db = createPublicClient()
  let { data, error: dbError } = await db.from('articles')
    .select('id,slug,title,summary,body_markdown,published_at,article_categories(categories(id,slug,title)),article_media(display_order,media_id)')
    .eq('slug', slug).eq('status','published').maybeSingle()
  if (dbError) return error('Unable to load article', 500)
  if (!data) {
    const { data: oldSlug } = await db.from('article_slug_history').select('article_id').eq('slug',slug).maybeSingle()
    if (oldSlug) {
      const result = await db.from('articles')
        .select('id,slug,title,summary,body_markdown,published_at,article_categories(categories(id,slug,title)),article_media(display_order,media_id)')
        .eq('id',oldSlug.article_id).eq('status','published').maybeSingle()
      data = result.data
      dbError = result.error
    }
  }
  if (dbError) return error('Unable to load article', 500)
  if (!data) return error('Not found', 404)
  const { data: sourceRows } = await db.from('published_article_sources')
    .select('id,title,citation,url').eq('article_id',data.id)
  let media
  try {
    const assets = await publicMediaByIds(db, (data.article_media || []).map(link => link.media_id))
    media = assets.map(asset => ({
      ...asset, display_order: data.article_media.find(link => link.media_id === asset.id)?.display_order ?? 0,
    })).sort((a, b) => a.display_order - b.display_order)
  } catch { return error('Unable to load published media', 503) }
  const categories = (data.article_categories || []).flatMap(x => x.categories ? [x.categories] : [])
  return json({ id: data.id, slug: data.slug, title: data.title, summary: data.summary,
    body_markdown: data.body_markdown, published_at: data.published_at,
    categories, sources: sourceRows || [], media: media.filter(Boolean) })
}
