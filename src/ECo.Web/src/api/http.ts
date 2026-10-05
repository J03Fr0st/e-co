/**
 * Client half of the antiforgery convention (S0): the API issues a script-readable
 * XSRF-TOKEN cookie from GET /api/v1/antiforgery, and every state-changing request
 * echoes it in the X-XSRF-TOKEN header. A rejected token (server keys rotated, or the
 * user signed in or out) is refreshed and the request retried once.
 */
export const XSRF_COOKIE = 'XSRF-TOKEN'
export const XSRF_HEADER = 'X-XSRF-TOKEN'
export const ANTIFORGERY_PROBLEM = '/problems/antiforgery'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE'])

export function readCookie(name: string, cookies: string = document.cookie): string | undefined {
  for (const part of cookies.split(';')) {
    const [key, ...value] = part.trim().split('=')
    if (key === name) return decodeURIComponent(value.join('='))
  }
  return undefined
}

export async function refreshAntiforgeryToken(): Promise<string> {
  await fetch('/api/v1/antiforgery', { credentials: 'same-origin' })
  const issued = readCookie(XSRF_COOKIE)
  if (!issued) throw new Error('The API did not issue an antiforgery token.')
  return issued
}

export async function ensureAntiforgeryToken(): Promise<string> {
  return readCookie(XSRF_COOKIE) ?? refreshAntiforgeryToken()
}

async function isAntiforgeryRejection(response: Response): Promise<boolean> {
  if (response.status !== 400 || !response.headers.get('content-type')?.includes('application/problem+json')) {
    return false
  }
  try {
    const problem: unknown = await response.clone().json()
    return typeof problem === 'object' && problem !== null && 'type' in problem && problem.type === ANTIFORGERY_PROBLEM
  } catch {
    return false
  }
}

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  const send = () => fetch(input, { ...init, method, headers, credentials: 'same-origin' })

  if (SAFE_METHODS.has(method)) return send()

  headers.set(XSRF_HEADER, await ensureAntiforgeryToken())
  const response = await send()
  if (!(await isAntiforgeryRejection(response))) return response

  headers.set(XSRF_HEADER, await refreshAntiforgeryToken())
  return send()
}
