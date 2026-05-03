import { apiFetch } from '@/lib/apiClient'
import type { Order } from '@/types'

interface OrderHistoryResponse {
  data: { content: any[] }
}

interface CheckoutResponse {
  data: {
    orderId: string
    paymentId: string
    orderStatus: string
    paymentStatus: string
    failureCode?: string
    failureMessage?: string
  }
}

type DeliveryStatus = 'READY' | 'DELIVERING' | 'DELIVERED' | 'RETURNED'
const DELIVERY_STATUS_MAP: Record<DeliveryStatus, Order['status']> = {
  READY: 'confirmed',
  DELIVERING: 'shipped',
  DELIVERED: 'delivered',
  RETURNED: 'delivered',
}

function mapOrderItem(d: any): Order {
  let status: Order['status'] = 'pending'
  if (d.orderStatus === 'PURCHASED') {
    status = DELIVERY_STATUS_MAP[d.deliveryStatus as DeliveryStatus] ?? 'confirmed'
  }

  return {
    id: d.orderId,
    dropId: '',
    dropName: d.productName ?? '',
    dropImage: d.productImageUrl ?? '',
    size: String(d.size ?? ''),
    price: d.amount ?? 0,
    orderDate: new Date(d.orderedAt),
    status,
    trackingNumber: d.trackingNumber ?? undefined,
    courier: undefined,
    deliveryAddress: undefined,
    estimatedDelivery: undefined,
    shippingEvents: undefined,
  }
}

export async function getOrders(): Promise<Order[]> {
  const body = await apiFetch<OrderHistoryResponse>('/api/orders?size=50')
  return (body.data.content ?? []).map(mapOrderItem)
}

export async function getOrder(id: string): Promise<Order | null> {
  const orders = await getOrders()
  return orders.find((o) => o.id === id) ?? null
}

export interface CreateOrderPayload {
  productOptionId: string
  paymentMethod: 'CARD' | 'ACCOUNT_TRANSFER' | 'VIRTUAL_ACCOUNT' | 'SIMPLE_PAY'
  amount: number
  size?: string
  address?: string
  phone?: string
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const idempotencyKey = crypto.randomUUID()
  const body = await apiFetch<CheckoutResponse>('/api/orders/checkout', {
    method: 'POST',
    body: JSON.stringify({
      productOptionId: payload.productOptionId,
      paymentMethod: payload.paymentMethod,
      amount: payload.amount,
      idempotencyKey,
    }),
  })
  const d = body.data

  if (d.paymentStatus === 'FAILED' || d.orderStatus === 'FAILED') {
    throw new Error(d.failureMessage ?? '결제에 실패했습니다')
  }

  return {
    id: d.orderId,
    dropId: '',
    dropName: '',
    dropImage: '',
    size: payload.size ?? '',
    price: payload.amount,
    orderDate: new Date(),
    status: d.orderStatus === 'PURCHASED' ? 'confirmed' : 'pending',
    trackingNumber: undefined,
    deliveryAddress: payload.address,
  }
}
