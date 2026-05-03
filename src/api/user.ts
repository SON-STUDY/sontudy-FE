import { apiFetch } from '@/lib/apiClient'
import { setToken } from '@/lib/auth'
import type { User } from '@/types'

interface LoginResponse {
  data: { accessToken: string; refreshToken: string }
}

interface UserInfoResponse {
  data: { name: string; email: string; address?: string; role: string }
}

export async function login(email: string, password: string): Promise<void> {
  const body = await apiFetch<LoginResponse>('/api/user/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(body.data.accessToken)
}

const isDevOrTest = import.meta.env.MODE === 'development' || import.meta.env.MODE === 'test'

export async function signUp(name: string, email: string, password: string): Promise<void> {
  const endpoint = isDevOrTest ? '/api/admin' : '/api/user'
  await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export async function applyForSeller(): Promise<void> {
  await apiFetch('/api/user/seller-application', { method: 'POST' })
}

export async function getMe(): Promise<User> {
  const body = await apiFetch<UserInfoResponse>('/api/user/info')
  const d = body.data
  return {
    id: d.email,
    name: d.name,
    email: d.email,
    joinedAt: new Date(),
    notificationsEnabled: false,
    role: d.role,
  }
}
