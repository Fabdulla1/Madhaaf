import { createPublicClient, supabaseConfigured } from '@/lib/supabase/server'
import { error } from '@/lib/server/http'

import { connection } from 'next/server'

const fields = 'id,headword,part_of_speech,usage_note,etymology_note,orthography_version_id,word_forms(id,spelling,is_preferred,note),inflected_forms(id,written_form,original_transcription,evidence_status),senses(id,gloss_en,definition_en,display_order,examples(id,kutchi_text,english_translation,note,display_order))'

export async function GET(request: Request) {
  await connection()
  if (!supabaseConfigured()) return error('Service is not configured', 503)
  const db = createPublicClient()
  const params = new URL(request.url).searchParams
  const q = params.get('q')?.trim().slice(0, 100) || ''
  const letter = params.get('letter')?.toUpperCase() || ''
  if (letter && !/^[A-Z]$/.test(letter)) return error('Invalid letter')
  const page = Math.min(Math.max(Number.parseInt(params.get('page') || '1',10) || 1,1),10000)
  const limit = Math.min(Math.max(Number.parseInt(params.get('limit') || '24',10) || 24,1),100)
  const offset = (page-1)*limit
  let ids: string[] | null = null
  let searchTotal = 0
  if (q) {
    const { data: matches, error: searchError } = await db.rpc('search_dictionary', {
      search_term: q, result_limit: limit, result_offset: offset,
    })
    if (searchError) return error('Unable to search dictionary', 500)
    const matchingRows = (matches || []) as Array<{ lexeme_id: string; total_count: number }>
    const matchingIds = matchingRows.map(v => v.lexeme_id)
    ids = matchingIds
    searchTotal = Number(matchingRows[0]?.total_count || 0)
    if (!matchingIds.length) return Response.json({ data: [], pagination: { page, limit, total: 0, hasMore: false } })
  }
  let query = db.from('lexemes').select(fields, { count: 'exact' }).eq('status','published')
  if (ids) query = query.in('id', ids)
  if (!q && letter) query = query.ilike('headword', `${letter}%`)
  if (!q) query = query.order('headword').range(offset, offset+limit-1)
  const { data, error: dbError, count } = await query
  if (dbError) return error('Unable to load dictionary', 500)
  const result = data || []
  if (ids) result.sort((a,b) => ids!.indexOf(a.id) - ids!.indexOf(b.id))
  const total = ids ? searchTotal : (count || 0)
  return Response.json({ data: result, pagination: { page, limit, total, hasMore: offset+result.length < total } },
    { headers: { 'Cache-Control': 'public, no-store' } })
}
