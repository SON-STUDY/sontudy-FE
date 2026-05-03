import { apiFetch } from '@/lib/apiClient'

// ─── 타입 ─────────────────────────────────────────────────────────────────────

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface SellerApplication {
  id: string
  userId: string
  userName: string
  status: ApplicationStatus
  appliedAt: string
}

export type ProductCategory = 'SNEAKERS' | 'LOAFERS' | 'SANDALS' | 'BOOTS' | 'ETC'
export type PaymentMethod = 'CARD' | 'ACCOUNT_TRANSFER' | 'VIRTUAL_ACCOUNT' | 'SIMPLE_PAY'

export interface ProductOption {
  size: number
  cost: number
  stock: number
}

export interface ProductRegistrationPayload {
  name: string
  description: string
  brand: string
  colorName: string
  colorHexCode: string
  imageUrls: string[]
  releasedAt: string        // ISO 8601 datetime
  category: ProductCategory
  options: ProductOption[]
}

export interface ShipmentPayload {
  courierCompany: string
  trackingNumber: string
}

// ─── API 함수 ─────────────────────────────────────────────────────────────────

export async function getSellerApplications(): Promise<SellerApplication[]> {
  const body = await apiFetch<{ data: SellerApplication[] }>('/api/admin/seller-applications')
  return body.data ?? []
}

export async function reviewSellerApplication(
  applicationId: string,
  status: ApplicationStatus,
): Promise<void> {
  await apiFetch(`/api/admin/seller-applications/${applicationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function registerProduct(payload: ProductRegistrationPayload): Promise<void> {
  await apiFetch('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function registerShipment(orderId: string, payload: ShipmentPayload): Promise<void> {
  await apiFetch(`/api/deliveries/orders/${orderId}/shipment`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
