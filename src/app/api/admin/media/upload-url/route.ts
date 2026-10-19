import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { getAdmin } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'
import { MEDIA_RULES } from '@/lib/server/media'

const schema = z.object({
  mime_type: z.string().max(100),
  bytes: z.number().int().positive(),
  original_name: z.string().trim().min(1).max(255),
}).strict()

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  try {
    const input = await parseJson(request, schema)
    const rule = MEDIA_RULES[input.mime_type]
    if (!rule || input.bytes > rule.max) return error('Unsupported file type or size')
    const path = `${randomUUID()}.${rule.ext}`
    const { data: intent, error: dbError } = await admin.supabase.from('media_upload_intents')
      .insert({ storage_path: path, mime_type: input.mime_type, bytes: input.bytes,
        original_name: input.original_name, created_by: admin.user.id })
      .select('id').single()
    if (dbError || !intent) return error('Unable to prepare upload', 500)
    const { data: signed, error: signError } = await admin.supabase.storage
      .from('heritage-media').createSignedUploadUrl(path, { upsert: false })
    if (signError || !signed) return error('Unable to prepare upload', 500)
    return json({ intent_id: intent.id, path, token: signed.token })
  } catch (cause) { return requestError(cause) }
}
