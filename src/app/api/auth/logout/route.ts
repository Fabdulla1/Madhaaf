import { createSessionClient } from '@/lib/supabase/server'
import { error, json, sameOrigin } from '@/lib/server/http'

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error('Invalid request origin', 403)
  const db = await createSessionClient()
  await db.auth.signOut()
  return json({ signedOut: true })
}
