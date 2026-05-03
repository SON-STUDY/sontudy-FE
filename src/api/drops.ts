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

function mapListItem(d: any, defaultStatus: Drop['status']): Drop {
  return {
    id: d.id,
    name: d.name,
    brand: d.brand,
    model: d.name,
    price: d.price ?? 0,
    image: d.imageUrl ?? '',
    dropDate: new Date(d.releasedAt),
    totalStock: d.stock ?? 0,
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
