import { z } from 'zod'
import { createServiceClient, getAdmin } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'
import { MEDIA_RULES, inspectMediaSignature } from '@/lib/server/media'
import { loadAdminMedia } from '@/lib/server/admin-media'

const schema = z.object({ intent_id: z.string().uuid() }).strict()

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  try {
    const input = await parseJson(request, schema)
    const { data: intent, error: intentError } = await admin.supabase.from('media_upload_intents')
      .select('*').eq('id', input.intent_id).eq('created_by', admin.user.id).maybeSingle()
    if (intentError) return error('Unable to check the upload request', 500)
    if (!intent) return error('Upload request unavailable', 404)
    if (intent.consumed_at && intent.finalized_media_id) {
      const asset = await loadAdminMedia(admin.supabase, intent.finalized_media_id)
      return asset ? json(asset) : error('The finalized media is unavailable', 404)
    }
    if (new Date(intent.expires_at) <= new Date()) return error('Upload request expired. Choose the file and upload again.', 409)
    const rule = Object.hasOwn(MEDIA_RULES, intent.mime_type) ? MEDIA_RULES[intent.mime_type] : null
    if (!rule || intent.bytes > rule.max) return error('Invalid upload request')
    const storage = admin.supabase.storage.from('heritage-media')
    const { data: info, error: infoError } = await storage.info(intent.storage_path)
    if (infoError || !info || info.size !== intent.bytes || info.contentType !== intent.mime_type)
      return error('Uploaded file size or type does not match the request')
    const { data: signed, error: signError } = await storage.createSignedUrl(intent.storage_path, 60)
    if (signError || !signed) return error('Unable to inspect uploaded file. You can retry finishing this upload.', 500)
    let signatureMatches = false
    try { signatureMatches = await inspectMediaSignature(signed.signedUrl, intent.mime_type) }
    catch { return error('Unable to inspect uploaded file. You can retry finishing this upload.', 502) }
    if (!signatureMatches) return error('File content does not match its type')
    let service
    try { service = createServiceClient() } catch { return error('Media uploads are not configured', 503) }
    // Only the server can finalize after inspection; a browser cannot call this RPC.
    const { data: id, error: finalizeError } = await service.rpc('finalize_media_upload', {
      upload_intent_id: intent.id, actor_id: admin.user.id,
    })
    if (finalizeError || !id) {
      const conflict = ['23503', '23514', '40001', 'P0002'].includes(finalizeError?.code || '')
      return error(conflict
        ? 'The upload or its selected people/article changed. Check the attachments and retry.'
        : 'Unable to finish this upload. Your file remains private; you can retry.', conflict ? 409 : 500)
    }
    const asset = await loadAdminMedia(admin.supabase, id)
    return asset ? json(asset, 201) : error('Upload saved, but its details could not be loaded. Refresh the library.', 500)
  } catch (cause) { return requestError(cause) }
}
