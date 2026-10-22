import { z } from 'zod'
import { createSessionClient } from '@/lib/supabase/server'
import { createAuthAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { recoveryCookie, validRecoveryToken } from '@/lib/server/recovery'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  try {
    const { password, current_password } = await parseJson(request, z.object({
      password: z.string().min(12).max(1024),
      current_password: z.string().min(1).optional(),
    }).strict())
    const db = await createSessionClient()
    const { data: { user } } = await db.auth.getUser()
    if (!user) return error('Unauthorized', 401)
    if (current_password) {
      if (current_password === password) return error('Choose a different password', 400)
      const { error: verifyError } = await db.auth.signInWithPassword({ email: user.email || '', password: current_password })
      if (verifyError) return error('Current password is incorrect', 403)
    } else if (!validRecoveryToken((await cookies()).get(recoveryCookie)?.value, user.id)) {
      return error('A valid reset link or current password is required', 403)
    }
    const { error: authError } = await db.auth.updateUser({ password })
    if (authError) return error('Unable to update password', 400)
    const manager = createAuthAdminClient()
    const { error: flagError } = await manager.from('app_users').update({ must_change_password: false }).eq('user_id', user.id)
    if (flagError) return error('Password updated, but account setup could not be completed', 500)
    ;(await cookies()).set(recoveryCookie, '', { path: '/api/auth/password', maxAge: 0 })
    return json({ updated: true })
  } catch (cause) { return requestError(cause) }
}
