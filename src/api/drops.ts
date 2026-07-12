import { apiFetch } from '@/lib/apiClient'
import type { Drop } from '@/types'

const STATUS_MAP: Record<string, Drop['status']> = {
  SCHEDULED: 'upcoming',
  ON_SALE: 'live',
  SOLD_OUT: 'sold-out',
  END: 'sold-out',
}

interface LiveResponse {
  data: { content: any[] }
}

interface ScheduledResponse {
  data: { content: any[] }
}

interface DetailResponse {
  data: {
    id: string
    name: string
    brand: string
    imageUrls: string[]
    releasedAt: string
    status: string
    options: { id: string; size: number; cost: number; stock: number }[]
  }
}

// 목록 응답의 재고 필드명이 백엔드에 따라 다를 수 있어(남은 재고 우선) 후보 키를 순서대로 탐색한다.
// 셋 다 없으면 옵션 재고 합계로 폴백한다.
const STOCK_KEYS = ['remainingStock', 'remainStock', 'stockQuantity', 'totalStock', 'stock'] as const

function pickStock(d: any): number {
  for (const key of STOCK_KEYS) {
    if (typeof d[key] === 'number') return d[key]
  }
  if (Array.isArray(d.options)) {
    return d.options.reduce((sum: number, o: { stock?: number }) => sum + (o.stock ?? 0), 0)
  }
  return 0
}

function mapListItem(d: any, defaultStatus: Drop['status']): Drop {
  const totalStock = pickStock(d)

  return {
    id: d.id,
    name: d.name,
    brand: d.brand,
    model: d.name,
    price: d.price ?? 0,
    image: d.imageUrl ?? '',
    dropDate: new Date(d.releasedAt),
    totalStock,
    sizes: [],
    status: d.status ? (STATUS_MAP[d.status] ?? defaultStatus) : defaultStatus,
    images: d.imageUrl ? [d.imageUrl] : [],
  }
}

export async function getDrops(): Promise<Drop[]> {
  const [liveRes, scheduledRes] = await Promise.allSettled([
    apiFetch<LiveResponse>('/api/products/live?page=0&size=10'),
    apiFetch<ScheduledResponse>('/api/products?dropStatus=SCHEDULED&page=0&size=20'),
  ])

  const liveItems: Drop[] =
    liveRes.status === 'fulfilled'
      ? (liveRes.value.data.content ?? []).map((d: any) => mapListItem(d, 'live'))
      : []

  const scheduledItems: Drop[] =
    scheduledRes.status === 'fulfilled'
      ? (scheduledRes.value.data.content ?? []).map((d: any) => mapListItem(d, 'upcoming'))
      : []

  return [...liveItems, ...scheduledItems]
}

export async function getDrop(id: string): Promise<Drop | null> {
  try {
    const body = await apiFetch<DetailResponse>(`/api/products/${id}`)
    const d = body.data
    return {
      id: d.id,
      name: d.name,
      brand: d.brand,
      model: d.name,
      price: d.options?.[0]?.cost ?? 0,
      image: d.imageUrls?.[0] ?? '',
      dropDate: new Date(d.releasedAt),
      totalStock: (d.options ?? []).reduce((sum, o) => sum + o.stock, 0),
      sizes: (d.options ?? []).map((o) => ({
        size: String(o.size),
        stock: o.stock,
        optionId: o.id,
      })),
      status: STATUS_MAP[d.status] ?? 'upcoming',
      images: d.imageUrls ?? [],
    }
  } catch {
    return null
  }
}
