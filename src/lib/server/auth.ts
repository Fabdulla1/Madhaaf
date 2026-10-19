import 'server-only'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { getAdmin } from '@/lib/supabase/server'

export async function getAdminSession() {
  return getAdmin()
}

export async function requireAdminPage() {
  await connection()
  const session = await getAdmin()
  if (!session) redirect('/login')
  return session
}
