import { mockUser } from '@/data/mockData'
import type { User } from '@/types'

// ─── 교체 지점 ────────────────────────────────────────────────────────────────
// 실제 API 연동 시 아래 함수 본문만 fetch 호출로 바꾸면 됩니다.
// 예)
//   export async function getMe(): Promise<User> {
//     const res = await fetch('/api/me', { credentials: 'include' })
//     if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다')
//     return res.json()
//   }
// ─────────────────────────────────────────────────────────────────────────────

export async function getMe(): Promise<User> {
  return mockUser
}
