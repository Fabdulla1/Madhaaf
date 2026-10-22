import { randomUUID } from 'node:crypto'
import { createServiceClient, getAdmin } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'
import { MEDIA_RULES, uploadMediaSchema } from '@/lib/media'

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  try {
    const input = await parseJson(request, uploadMediaSchema)
    // Fail before uploading if the server cannot complete file verification.
    try { createServiceClient() } catch { return error('Media uploads are not configured', 503) }
    const rule = MEDIA_RULES[input.mime_type]
    if (input.member_ids.length) {
      const { data: members, error: memberError } = await admin.supabase.from('family_members')
        .select('id').in('id', input.member_ids).neq('status', 'archived')
      if (memberError) return error('Unable to check selected people', 500)
      if (members?.length !== input.member_ids.length) return error('A selected person is unavailable. Choose an active family profile.', 409)
    }
    if (input.article_id) {
      const { data: article, error: articleError } = await admin.supabase.from('articles')
        .select('id,status').eq('id', input.article_id).maybeSingle()
      if (articleError) return error('Unable to check the selected article', 500)
      if (!article || !['draft', 'review'].includes(article.status)) return error('Choose a draft or review article. Published articles must be moved to draft before adding media.', 409)
    }
    const { mime_type, bytes, original_name, ...payload } = input
    const path = `${randomUUID()}.${rule.ext}`
    const { data: intent, error: dbError } = await admin.supabase.from('media_upload_intents')
      .insert({ storage_path: path, mime_type, bytes, original_name, payload, created_by: admin.user.id })
      .select('id').single()
    if (dbError || !intent) return error('Unable to prepare upload', 500)
    const { data: signed, error: signError } = await admin.supabase.storage
      .from('heritage-media').createSignedUploadUrl(path, { upsert: false })
    if (signError || !signed) return error('Unable to prepare upload', 500)
    return json({ intent_id: intent.id, path, token: signed.token })
  } catch (cause) { return requestError(cause) }
}
