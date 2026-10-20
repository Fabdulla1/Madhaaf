/** Keep recovery links on an application-controlled host, regardless of Host. */
export function resetRedirectUrl(siteUrl = process.env.SITE_URL, production = process.env.NODE_ENV === 'production') {
  const base = siteUrl || (production ? 'https://madhaaf.vercel.app' : 'http://localhost:3000')
  const url = new URL(base)
  if (url.username || url.password || (url.protocol !== 'https:' && !(url.protocol === 'http:' && !production && ['localhost', '127.0.0.1'].includes(url.hostname)))) {
    throw new Error('Invalid SITE_URL configuration')
  }
  return new URL('/api/auth/callback?next=/reset-password', url.origin).toString()
}
