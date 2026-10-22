import { z } from 'zod'
import { getAdmin } from '@/lib/supabase/server'
import { createAuthAdminClient } from '@/lib/supabase/admin'
import { error, parseJson, requestError, sameOrigin } from '@/lib/server/http'

const createUser = z.object({
  email: z.email().max(320),
  display_name: z.string().trim().min(1).max(100),
  password: z.string().min(12).max(1024),
}).strict()

export async function GET(request: Request) {
  const session = await getAdmin()
  if (!session) return error('Unauthorized', 401)
  if (!session.isFounder) return error('Founder access required', 403)
  try {
    const page = Math.min(Math.max(Number(new URL(request.url).searchParams.get('page')) || 1, 1), 10000)
    const manager = createAuthAdminClient()
    const { data: auth, error: authError } = await manager.auth.admin.listUsers({ page, perPage: 100 })
    if (authError) return error('Unable to load users', 502)
    const ids = auth.users.map(user => user.id)
    const { data: accounts, error: dbError } = ids.length
      ? await manager.from('app_users').select('user_id,role,must_change_password,is_founder').in('user_id', ids)
      : { data: [], error: null }
    if (dbError) return error('Unable to load user roles', 502)
    const accountById = new Map((accounts || []).map(row => [row.user_id, row]))
    const users = auth.users.filter(user => accountById.has(user.id)).map(user => ({
      id: user.id,
      email: user.email || '',
      display_name: typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : '',
      role: accountById.get(user.id)?.role,
      is_founder: accountById.get(user.id)?.is_founder ?? false,
      must_change_password: accountById.get(user.id)?.must_change_password ?? false,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at || null,
    }))
    return Response.json({ data: users, pagination: { page, hasMore: auth.users.length === 100 } }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch {
    return error('Unable to load users', 500)
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const session = await getAdmin()
  if (!session) return error('Unauthorized', 401)
  if (!session.isFounder) return error('Founder access required', 403)
  try {
    const input = await parseJson(request, createUser)
    const manager = createAuthAdminClient()
    const { data: created, error: authError } = await manager.auth.admin.createUser({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      email_confirm: true,
      user_metadata: { display_name: input.display_name },
    })
    if (authError || !created.user) return error('Could not create user. Check the address and password policy.', 400)
    const { error: dbError } = await manager.from('app_users').insert({ user_id: created.user.id, role: 'admin', must_change_password: true })
    if (dbError) {
      await manager.auth.admin.deleteUser(created.user.id)
      return error('Could not grant administrator access', 500)
    }
    return Response.json({ data: {
      id: created.user.id, email: created.user.email, display_name: input.display_name, role: 'admin', must_change_password: true, is_founder: false,
    } }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } })
  } catch (cause) {
    return requestError(cause)
  }
}
