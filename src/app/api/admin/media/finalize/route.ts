import { z } from 'zod'
import { getAdmin } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'
import { MEDIA_RULES, matchesSignature } from '@/lib/server/media'

const schema = z.object({
  intent_id: z.string().uuid(),
  alt_text: z.string().max(500).nullable().optional(),
  caption: z.string().max(2000).nullable().optional(),
  speaker_name: z.string().max(200).nullable().optional(),
  attribution: z.string().max(1000).nullable().optional(),
  consent_confirmed: z.boolean().optional(),
}).strict()

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  try {
    const input = await parseJson(request, schema)
    const { data: intent, error: intentError } = await admin.supabase.from('media_upload_intents')
      .select('*').eq('id',input.intent_id).eq('created_by',admin.user.id)
      .is('consumed_at',null).maybeSingle()
    if (intentError || !intent || new Date(intent.expires_at) < new Date()) return error('Upload request expired or unavailable', 404)
    const rule = MEDIA_RULES[intent.mime_type]
    if (!rule || intent.bytes > rule.max) return error('Invalid upload request', 400)
    const storage = admin.supabase.storage.from('heritage-media')
    const { data: info, error: infoError } = await storage.info(intent.storage_path)
    if (infoError || !info || info.size !== intent.bytes || info.contentType !== intent.mime_type)
      return error('Uploaded file size or type does not match the request', 400)
    const { data: blob, error: downloadError } = await storage.download(intent.storage_path)
    if (downloadError || !blob) return error('Unable to inspect uploaded file', 500)
    const signature = new Uint8Array(await blob.slice(0, 16).arrayBuffer())
    if (!matchesSignature(signature, intent.mime_type)) return error('File content does not match its type', 400)
    const { data: asset, error: dbError } = await admin.supabase.from('media_assets').insert({
      kind: rule.kind, storage_path: intent.storage_path, mime_type: intent.mime_type,
      bytes: intent.bytes, original_name: intent.original_name,
      alt_text: input.alt_text || null, caption: input.caption || null,
      speaker_name: input.speaker_name || null, attribution: input.attribution || null,
      consent_confirmed: input.consent_confirmed || false, public_approved: false,
      created_by: admin.user.id,
    }).select('*').single()
    if (dbError || !asset) return error('Unable to save media metadata; contact an administrator', 500)
    await admin.supabase.from('media_upload_intents').update({ consumed_at: new Date().toISOString() }).eq('id',intent.id).is('consumed_at',null)
    return json(asset, 201)
  } catch (cause) { return requestError(cause) }
}
