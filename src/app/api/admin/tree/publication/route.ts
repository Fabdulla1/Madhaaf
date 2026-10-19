import { z } from 'zod'
import { getAdmin } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'

export async function GET() {
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  const { data, error: dbError } = await admin.supabase.from('family_tree_publication')
    .select('enabled,updated_at').eq('singleton', true).single()
  if (dbError) return error('Unable to load publication settings', 500)
  return json(data)
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const admin = await getAdmin()
  if (!admin) return error('Unauthorized', 401)
  try {
    const { enabled } = await parseJson(request, z.object({ enabled: z.boolean() }).strict())
    const { data, error: dbError } = await admin.supabase.from('family_tree_publication')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('singleton', true).select('enabled,updated_at').single()
    if (dbError) return error('Unable to update publication settings', 500)
    return json(data)
  } catch (cause) { return requestError(cause) }
}
