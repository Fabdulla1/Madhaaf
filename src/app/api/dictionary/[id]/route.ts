import { createPublicClient, supabaseConfigured } from '@/lib/supabase/server'
import { error, json } from '@/lib/server/http'
import { publicMediaByIds } from '@/lib/server/public-media'
import { z } from 'zod'

import { connection } from 'next/server'

function withPublicSource<T extends { source_id: string | null }>(example: T, titles: Map<string, string>) {
  const { source_id, ...publicFields } = example
  return { ...publicFields, source_title: source_id ? titles.get(source_id) ?? null : null }
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await connection()
  if (!supabaseConfigured()) return error('Service is not configured', 503)
  const { id } = await context.params
  if (!z.string().uuid().safeParse(id).success) return error('Not found', 404)
  const db = createPublicClient()
  const { data, error: dbError } = await db.from('lexemes')
    .select('id,headword,part_of_speech,morphology_note,linguistic_tags,usage_note,etymology_note,orthography_version_id,word_forms(id,spelling,is_preferred,note),inflected_forms(id,written_form,grammatical_person,grammatical_number,gender,tense,aspect,mood,politeness,original_transcription,evidence_status,note),senses(id,gloss_en,definition_en,display_order,examples(id,kutchi_text,english_translation,note,original_transcription,source_id,display_order))')
    .eq('id', id).eq('status', 'published').maybeSingle()
  if (dbError) return error('Unable to load entry', 500)
  if (!data) return error('Not found', 404)
  const { data: exampleLinks, error: linksError } = await db.from('example_lexemes')
    .select('example_id,examples(id,kutchi_text,english_translation,note,original_transcription,source_id)')
    .eq('lexeme_id', id)
  if (linksError) return error('Unable to load linked examples', 500)
  const linkedExamples = (exampleLinks || []).flatMap(link => link.examples || [])
  const sourceIds = [...new Set([
    ...(data.senses || []).flatMap(sense => (sense.examples || []).map(example => example.source_id)),
    ...linkedExamples.map(example => example.source_id),
  ].filter((sourceId): sourceId is string => !!sourceId))]
  const { data: sources, error: sourceError } = sourceIds.length
    ? await db.from('published_sources').select('id,title').in('id', sourceIds)
    : { data: [], error: null }
  if (sourceError) return error('Unable to load example sources', 500)
  const sourceTitles = new Map((sources || []).map(source => [source.id, source.title]))
  const senses = (data.senses || []).map(sense => ({
    ...sense,
    examples: (sense.examples || []).map(example => withPublicSource(example, sourceTitles)),
  }))
  const { data: links, error: mediaError } = await db.from('lexeme_media').select('purpose,media_id').eq('lexeme_id', id)
  if (mediaError) return error('Unable to load media links', 503)
  let media
  try {
    const assets = await publicMediaByIds(db, (links || []).map(link => link.media_id))
    media = assets.map(asset => ({ ...asset, purpose: links?.find(link => link.media_id === asset.id)?.purpose }))
  } catch { return error('Unable to load published media', 503) }
  return json({ ...data, senses, linked_examples: linkedExamples.map(example => withPublicSource(example, sourceTitles)), media: media.filter(Boolean) })
}
