import { getToken, clearToken } from './auth'

const BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? ''

export async function apiFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (token) headers.set('Authorization', `Bearer ${token}`)
  // caller-supplied headers override defaults
  if (init.headers) {
    new Headers(init.headers as HeadersInit).forEach((v, k) => headers.set(k, v))
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers })

  if (res.status === 401) {
    clearToken()
    window.dispatchEvent(new Event('auth:expired'))
  }

  const body: { code?: string; message?: string; data?: unknown } = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.message ?? `요청 실패 (${res.status})`)
  return body as T
}
