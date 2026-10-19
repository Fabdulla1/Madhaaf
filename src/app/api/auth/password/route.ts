import { z } from 'zod'
import { createSessionClient } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  try {
    const { password } = await parseJson(request, z.object({ password: z.string().min(12).max(1024) }).strict())
    const db = await createSessionClient()
    const { data: { user } } = await db.auth.getUser()
    if (!user) return error('Unauthorized', 401)
    const { error: authError } = await db.auth.updateUser({ password })
    if (authError) return error('Unable to update password', 400)
    return json({ updated: true })
  } catch (cause) { return requestError(cause) }
}
