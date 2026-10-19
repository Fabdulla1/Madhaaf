import { NextResponse } from 'next/server'
import { createSessionClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next')
  const safeNext = next === '/reset-password' ? next : '/admin'
  if (!code) return NextResponse.redirect(new URL('/login?error=invalid-link', url.origin))
  const db = await createSessionClient()
  const { error } = await db.auth.exchangeCodeForSession(code)
  return NextResponse.redirect(new URL(error ? '/login?error=invalid-link' : safeNext, url.origin))
}
