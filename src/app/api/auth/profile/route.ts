import { z } from 'zod'
import { getAdmin } from '@/lib/supabase/server'
import { createAuthAdminClient } from '@/lib/supabase/admin'
import { error, json, parseJson, requestError, sameOrigin } from '@/lib/server/http'

const changes = z.object({
  display_name: z.string().trim().min(1).max(100).optional(),
  email: z.email().max(320).optional(),
  password: z.string().min(12).max(1024).optional(),
  current_password: z.string().min(1).optional(),
}).strict().refine(value => value.display_name !== undefined || value.email !== undefined || value.password !== undefined)

export async function GET() {
  const session = await getAdmin({ allowPasswordChange: true })
  if (!session) return error('Unauthorized', 401)
  return json({
    id: session.user.id,
    email: session.user.email || '',
    display_name: typeof session.user.user_metadata?.display_name === 'string' ? session.user.user_metadata.display_name : '',
    is_founder: session.isFounder,
    must_change_password: session.mustChangePassword,
  })
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const session = await getAdmin({ allowPasswordChange: true })
  if (!session) return error('Unauthorized', 401)
  try {
    const input = await parseJson(request, changes)
    if ((input.email !== undefined || input.password !== undefined) && !input.current_password)
      return error('Current password is required to change sign-in credentials', 400)
    if (input.password !== undefined && input.password === input.current_password)
      return error('Choose a different password', 400)
    if (input.current_password) {
      const { error: verifyError } = await session.supabase.auth.signInWithPassword({
        email: session.user.email || '', password: input.current_password,
      })
      if (verifyError) return error('Current password is incorrect', 403)
    }
    const update: { email?: string; password?: string; data?: Record<string, unknown> } = {}
    if (input.email !== undefined) update.email = input.email.trim().toLowerCase()
    if (input.password !== undefined) update.password = input.password
    if (input.display_name !== undefined) update.data = { ...session.user.user_metadata, display_name: input.display_name }
    const { data, error: updateError } = await session.supabase.auth.updateUser(update)
    if (updateError || !data.user) return error('Unable to update account', 400)
    if (input.password !== undefined) {
      const manager = createAuthAdminClient()
      const { error: flagError } = await manager.from('app_users').update({ must_change_password: false }).eq('user_id', session.user.id)
      if (flagError) return error('Password updated, but account setup could not be completed', 500)
    }
    return json({
      id: data.user.id,
      email: data.user.email || '',
      display_name: typeof data.user.user_metadata?.display_name === 'string' ? data.user.user_metadata.display_name : '',
      is_founder: session.isFounder,
      must_change_password: input.password === undefined ? session.mustChangePassword : false,
      email_confirmation_pending: Boolean(input.email && input.email.trim().toLowerCase() !== data.user.email?.toLowerCase()),
    })
  } catch (cause) { return requestError(cause) }
}
