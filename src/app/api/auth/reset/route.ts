import { z } from 'zod'
import { createSessionClient } from '@/lib/supabase/server'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  try {
    const { email } = await parseJson(request, z.object({ email: z.email() }).strict())
    const db = await createSessionClient()
    await db.auth.resetPasswordForEmail(email, { redirectTo: `${new URL(request.url).origin}/api/auth/callback?next=/reset-password` })
    // Non-enumerating response. Supabase email delivery must be configured.
    return json({ message: 'If this account exists, a password reset email will be sent.' })
  } catch (cause) { return requestError(cause) }
}
