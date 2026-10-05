/**
 * Client half of the antiforgery convention (S0): the API issues a script-readable
 * XSRF-TOKEN cookie from GET /api/v1/antiforgery, and every state-changing request
 * echoes it in the X-XSRF-TOKEN header.
 */
export const XSRF_COOKIE = 'XSRF-TOKEN'
export const XSRF_HEADER = 'X-XSRF-TOKEN'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE'])

export function readCookie(name: string, cookies: string = document.cookie): string | undefined {
  for (const part of cookies.split(';')) {
    const [key, ...value] = part.trim().split('=')
    if (key === name) return decodeURIComponent(value.join('='))
  }
  return undefined
}

export async function ensureAntiforgeryToken(): Promise<string> {
  const existing = readCookie(XSRF_COOKIE)
  if (existing) return existing

  await fetch('/api/v1/antiforgery', { credentials: 'same-origin' })
  const issued = readCookie(XSRF_COOKIE)
  if (!issued) throw new Error('The API did not issue an antiforgery token.')
  return issued
}

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  if (!SAFE_METHODS.has(method)) {
    headers.set(XSRF_HEADER, await ensureAntiforgeryToken())
  }
  return fetch(input, { ...init, method, headers, credentials: 'same-origin' })
}
