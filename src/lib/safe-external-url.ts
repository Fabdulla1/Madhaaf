/** Accept only ordinary web links in editorial content and citations. */
export function safeExternalUrl(value: string): string | null {
  if (/[\u0000-\u001f\u007f]/.test(value)) return null
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password)
      return null
    return url.href
  } catch {
    return null
  }
}
