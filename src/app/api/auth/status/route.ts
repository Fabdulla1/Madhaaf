import { getAdmin } from '@/lib/supabase/server'
import { json } from '@/lib/server/http'

export async function GET() {
  return json({ admin: Boolean(await getAdmin()) })
}
