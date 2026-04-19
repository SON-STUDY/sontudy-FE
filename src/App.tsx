import { useState } from 'react'
import { HomePage } from '@/pages/HomePage'
import { OrdersPage } from '@/pages/OrdersPage'
import { DeliveryPage } from '@/pages/DeliveryPage'
import { MyPage } from '@/pages/MyPage'
import { CartPage } from '@/pages/CartPage'
import type { Page } from '@/types'

export default function App() {
  const [page, setPage] = useState<Page>('home')

  if (page === 'orders') {
    return <OrdersPage onNavigate={setPage} />
  }

  if (page === 'mypage') {
    return <MyPage onNavigate={setPage} />
  }

  if (page === 'cart') {
    return <CartPage onNavigate={setPage} />
  }

  if (typeof page === 'object' && page.name === 'delivery') {
    return <DeliveryPage orderId={page.orderId} onNavigate={setPage} />
  }

  return <HomePage onNavigate={setPage} />
}
