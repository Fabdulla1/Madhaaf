import { z } from 'zod'
import { getAdmin } from '@/lib/supabase/server'
import { createAuthAdminClient } from '@/lib/supabase/admin'
import { error, parseJson, requestError, sameOrigin } from '@/lib/server/http'

const updateUser = z.object({
  email: z.email().max(320).optional(),
  display_name: z.string().trim().min(1).max(100).optional(),
  password: z.string().min(12).max(1024).optional(),
}).strict().refine(value => Object.keys(value).length > 0)

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  if (!await getAdmin()) return error('Unauthorized', 401)
  try {
    const { id } = await context.params
    if (!z.uuid().safeParse(id).success) return error('Not found', 404)
    const input = await parseJson(request, updateUser)
    const manager = createAuthAdminClient()
    const { data: account, error: accountError } = await manager.from('app_users')
      .select('user_id').eq('user_id', id).eq('role', 'admin').maybeSingle()
    if (accountError || !account) return error('User not found', 404)
    const { data: current, error: currentError } = await manager.auth.admin.getUserById(id)
    if (currentError || !current.user) return error('User not found', 404)
    const attributes: {
      email?: string;
      email_confirm?: boolean;
      password?: string;
      user_metadata?: Record<string, unknown>;
    } = {}
    if (input.email !== undefined) {
      attributes.email = input.email.trim().toLowerCase()
      attributes.email_confirm = true
    }
    if (input.display_name !== undefined) {
      attributes.user_metadata = { ...current.user.user_metadata, display_name: input.display_name }
    }
    if (input.password !== undefined) attributes.password = input.password
    const { data: updated, error: updateError } = await manager.auth.admin.updateUserById(id, attributes)
    if (updateError || !updated.user) return error('Could not update user. Check the address and password policy.', 400)
    return Response.json({ data: {
      id: updated.user.id,
      email: updated.user.email || '',
      display_name: updated.user.user_metadata?.display_name || '',
      role: 'admin',
    } }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (cause) {
    return requestError(cause)
  }
}
