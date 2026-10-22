import { getAdmin } from '@/lib/supabase/server'
import { json } from '@/lib/server/http'

export async function GET() {
  const session = await getAdmin({ allowPasswordChange: true })
  return json({ admin: Boolean(session), is_founder: session?.isFounder ?? false, must_change_password: session?.mustChangePassword ?? false })
}
