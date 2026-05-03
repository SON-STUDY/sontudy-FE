import { useState, useEffect } from 'react'
import { HomePage } from '@/pages/HomePage'
import { OrdersPage } from '@/pages/OrdersPage'
import { DeliveryPage } from '@/pages/DeliveryPage'
import { MyPage } from '@/pages/MyPage'
import { CartPage } from '@/pages/CartPage'
import { LoginPage } from '@/pages/LoginPage'
import { isAuthenticated } from '@/lib/auth'
import type { Page } from '@/types'

export default function App() {
  const [page, setPage] = useState<Page>(() => (isAuthenticated() ? 'home' : 'login'))

  // 토큰 만료 이벤트 수신 → 로그인 페이지로
  useEffect(() => {
    const handler = () => setPage('login')
    window.addEventListener('auth:expired', handler)
    return () => window.removeEventListener('auth:expired', handler)
  }, [])

  if (page === 'login') {
    return <LoginPage onNavigate={setPage} />
  }

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
