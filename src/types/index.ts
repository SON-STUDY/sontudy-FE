export interface Drop {
  id: string
  name: string
  brand: string
  model: string
  price: number
  image: string
  dropDate: Date
  totalStock: number
  sizes: { size: string; stock: number }[]
  status: 'upcoming' | 'live' | 'sold-out'
  images: string[]
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
}
