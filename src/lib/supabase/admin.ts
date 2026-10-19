import 'server-only'

import { createClient } from '@supabase/supabase-js'

/** Only call this after verifying the requester's administrator session. */
export function createAuthAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('Supabase administrator credentials are not configured')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
