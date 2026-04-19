import { mockDrops } from '@/data/mockData'
import type { Drop } from '@/types'

// ─── 교체 지점 ────────────────────────────────────────────────────────────────
// 실제 API 연동 시 아래 함수 본문만 fetch 호출로 바꾸면 됩니다.
// 예)
//   export async function getDrops(): Promise<Drop[]> {
//     const res = await fetch('/api/drops')
//     if (!res.ok) throw new Error('드랍 목록을 불러오지 못했습니다')
//     return res.json()
//   }
// ─────────────────────────────────────────────────────────────────────────────

export async function getDrops(): Promise<Drop[]> {
  return mockDrops
}

export async function getDrop(id: string): Promise<Drop | null> {
  return mockDrops.find((d) => d.id === id) ?? null
}
