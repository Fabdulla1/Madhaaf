import 'server-only'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Supabase URL and publishable key are required')
  return { url, key }
}

export function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

export async function createSessionClient() {
  const cookieStore = await cookies()
  const { url, key } = config()
  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(items) {
        for (const { name, value, options } of items) {
          // Server Components cannot write cookies. Proxy refreshes sessions
          // before rendering; route handlers can persist changes here.
          try { cookieStore.set(name, value, options) } catch { /* read-only render */ }
        }
      },
    },
  })
}

export function createPublicClient() {
  const { url, key } = config()
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function getAdmin() {
  // Accessing request cookies before optional configuration prevents admin
  // routes from being prerendered as a cached 401 during an unconfigured build.
  await cookies()
  if (!supabaseConfigured()) return null
  const supabase = await createSessionClient()
  // getUser verifies the JWT with the Auth server; getSession alone does not.
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const { data: account } = await supabase.from('app_users')
    .select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle()
  return account ? { supabase, user } : null
}
