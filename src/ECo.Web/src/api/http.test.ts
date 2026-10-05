import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, readCookie, XSRF_HEADER } from '@/api/http'

function clearCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

describe('readCookie', () => {
  it('finds and decodes a named cookie', () => {
    expect(readCookie('XSRF-TOKEN', 'a=1; XSRF-TOKEN=ab%2Bc%3D%3D; b=2')).toBe('ab+c==')
  })

  it('returns undefined when the cookie is absent', () => {
    expect(readCookie('XSRF-TOKEN', 'a=1')).toBeUndefined()
  })
})

describe('apiFetch', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    clearCookie('XSRF-TOKEN')
  })

  function sentHeaders(callIndex: number): Headers {
    return new Headers(fetchMock.mock.calls[callIndex]?.[1]?.headers)
  }

  it('sends the token header on state-changing requests', async () => {
    document.cookie = 'XSRF-TOKEN=abc; path=/'

    await apiFetch('/api/v1/bag/lines/X', { method: 'put' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(sentHeaders(0).get(XSRF_HEADER)).toBe('abc')
  })

  it('does not send the token header on safe requests', async () => {
    document.cookie = 'XSRF-TOKEN=abc; path=/'

    await apiFetch('/api/v1/products')

    expect(sentHeaders(0).has(XSRF_HEADER)).toBe(false)
  })

  it('fetches a token first when none has been issued', async () => {
    fetchMock.mockImplementationOnce(async () => {
      document.cookie = 'XSRF-TOKEN=fresh; path=/'
      return new Response(null, { status: 204 })
    })

    await apiFetch('/api/v1/checkout', { method: 'POST' })

    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/v1/antiforgery')
    expect(sentHeaders(1).get(XSRF_HEADER)).toBe('fresh')
  })
})
