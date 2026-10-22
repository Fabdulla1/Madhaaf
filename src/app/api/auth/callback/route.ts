import { NextResponse } from 'next/server'
import { createSessionClient } from '@/lib/supabase/server'
import { recoveryCookie, recoveryToken } from '@/lib/server/recovery'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next')
  const safeNext = next === '/reset-password' ? next : '/admin'
  if (!code) return NextResponse.redirect(new URL('/login?error=invalid-link', url.origin))
  const db = await createSessionClient()
  const { data, error } = await db.auth.exchangeCodeForSession(code)
  const response = NextResponse.redirect(new URL(error ? '/login?error=invalid-link' : safeNext, url.origin))
  if (!error && data.user && safeNext === '/reset-password') {
    response.cookies.set(recoveryCookie, recoveryToken(data.user.id), {
      httpOnly: true, secure: url.protocol === 'https:', sameSite: 'lax',
      path: '/api/auth/password', maxAge: 900,
    })
  }
  return response
}
