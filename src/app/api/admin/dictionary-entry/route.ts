import { z } from 'zod'
import { getAdmin } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'

const entry = z.object({
  headword: z.string().trim().min(1).max(200),
  part_of_speech: z.string().trim().max(100).optional(),
  morphology_note: z.string().trim().max(20000).optional(),
  linguistic_tags: z.array(z.string().trim().min(1).max(60)).max(20),
  usage_note: z.string().trim().max(20000).optional(),
  etymology_note: z.string().trim().max(20000).optional(),
  gloss_en: z.string().trim().min(1).max(500),
  definition_en: z.string().trim().max(20000).optional(),
  kutchi_text: z.string().trim().max(2000).optional(),
  english_translation: z.string().trim().max(2000).optional(),
}).strict().superRefine((value, context) => {
  if (value.english_translation && !value.kutchi_text) {
    context.addIssue({ code: 'custom', path: ['english_translation'], message: 'Add a Kutchi sentence before its translation' })
  }
})

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  try {
    const input = await parseJson(request, entry)
    const { data: id, error: dbError } = await admin.supabase.rpc('create_dictionary_entry', { input })
    if (dbError) return error(dbError.message, dbError.code === '23505' || dbError.code === '23514' ? 409 : 400)
    return json({ id }, 201)
  } catch (cause) { return requestError(cause) }
}
