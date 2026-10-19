import { z } from 'zod'
import { createSessionClient } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'

const credentials = z.object({ email: z.email(), password: z.string().min(1) }).strict()

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  try {
    const { email, password } = await parseJson(request, credentials)
    const db = await createSessionClient()
    const { data, error: authError } = await db.auth.signInWithPassword({ email, password })
    if (authError || !data.user) return error('Invalid email or password', 401)
    const { data: account } = await db.from('app_users').select('role').eq('user_id', data.user.id).eq('role', 'admin').maybeSingle()
    if (!account) {
      await db.auth.signOut()
      return error('This account is not authorized to administer the site', 403)
    }
    return json({ user: { id: data.user.id, email: data.user.email }, role: 'admin' })
  } catch (cause) { return requestError(cause) }
}
