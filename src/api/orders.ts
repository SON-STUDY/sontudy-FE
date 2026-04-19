import { mockOrders } from '@/data/mockData'
import type { Order } from '@/types'

// ─── 교체 지점 ────────────────────────────────────────────────────────────────
// 실제 API 연동 시 아래 함수 본문만 fetch 호출로 바꾸면 됩니다.
// 예)
//   export async function getOrders(): Promise<Order[]> {
//     const res = await fetch('/api/orders', { credentials: 'include' })
//     if (!res.ok) throw new Error('주문 목록을 불러오지 못했습니다')
//     return res.json()
//   }
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  return [...mockOrders].sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime())
}

export async function getOrder(id: string): Promise<Order | null> {
  return mockOrders.find((o) => o.id === id) ?? null
}

export interface CreateOrderPayload {
  dropId: string
  size: string
  address: string
  phone: string
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  // 실제 API:
  //   const res = await fetch('/api/orders', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(payload),
  //   })
  //   if (!res.ok) throw new Error('주문에 실패했습니다')
  //   return res.json()

  const drop = mockOrders.find((o) => o.dropId === payload.dropId)
  const newOrder: Order = {
    id: `ORD-${Date.now()}`,
    dropId: payload.dropId,
    dropName: drop?.dropName ?? '',
    dropImage: drop?.dropImage ?? '',
    size: payload.size,
    price: 0,
    orderDate: new Date(),
    status: 'pending',
    deliveryAddress: payload.address,
  }
  return newOrder
}
