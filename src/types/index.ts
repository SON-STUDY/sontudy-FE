export interface Drop {
  id: string
  name: string
  brand: string
  model: string
  price: number
  image: string
  dropDate: Date
  totalStock: number
  sizes: { size: string; stock: number; optionId?: string }[]
  status: 'upcoming' | 'live' | 'sold-out'
  images: string[]
}

export interface ShippingEvent {
  status: string
  description: string
  location: string
  timestamp: Date
}

export interface Order {
  id: string
  dropId: string
  dropName: string
  dropImage: string
  size: string
  price: number
  orderDate: Date
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  trackingNumber?: string
  courier?: string
  deliveryAddress?: string
  estimatedDelivery?: Date
  shippingEvents?: ShippingEvent[]
}

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  joinedAt: Date
  notificationsEnabled: boolean
}

export type Page =
  | 'home'
  | 'orders'
  | 'mypage'
  | 'cart'
  | 'login'
  | { name: 'delivery'; orderId: string }
