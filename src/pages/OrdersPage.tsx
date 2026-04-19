import { Package, Truck, CheckCircle, Clock, ChevronRight } from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'
import { AppHeader, AppBottomNav } from '@/components/AppNav'
import { Skeleton } from '@/components/ui/skeleton'
import type { Order, Page } from '@/types'
import { cn } from '@/lib/utils'

interface OrdersPageProps {
  onNavigate: (page: Page) => void
}

const STATUS_STEPS: Order['status'][] = ['pending', 'confirmed', 'shipped', 'delivered']

const STATUS_META: Record<Order['status'], { icon: React.ElementType; label: string; color: string; bg: string }> = {
  pending:   { icon: Clock,       label: '결제 대기', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  confirmed: { icon: Package,     label: '결제 완료', color: 'text-blue-700',   bg: 'bg-blue-100'   },
  shipped:   { icon: Truck,       label: '배송 중',   color: 'text-purple-700', bg: 'bg-purple-100' },
  delivered: { icon: CheckCircle, label: '배송 완료', color: 'text-green-700',  bg: 'bg-green-100'  },
}

export function OrdersPage({ onNavigate }: OrdersPageProps) {
  const { data: orders, isLoading, error } = useOrders()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader currentPage="orders" onNavigate={onNavigate} />

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-4 pb-24 md:pb-8 space-y-3">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-destructive/10 text-destructive text-sm">{error.message}</div>
        )}
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </>
        ) : orders.length === 0 ? (
          <EmptyOrders onGoHome={() => onNavigate('home')} />
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => onNavigate({ name: 'delivery', orderId: order.id })}
            />
          ))
        )}
      </main>

      <AppBottomNav currentPage="orders" onNavigate={onNavigate} />
    </div>
  )
}

function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const meta = STATUS_META[order.status]
  const Icon = meta.icon
  const stepIdx = STATUS_STEPS.indexOf(order.status)

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-border bg-card overflow-hidden text-left transition-all hover:shadow-md active:scale-[0.99]"
    >
      {/* 주문 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <span className="text-xs text-muted-foreground">주문번호</span>
          <span className="ml-2 text-xs font-mono font-medium">{order.id}</span>
        </div>
        <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full', meta.bg, meta.color)}>
          <Icon className="w-3 h-3" />
          {meta.label}
        </span>
      </div>

      {/* 상품 정보 */}
      <div className="flex gap-3 px-4 py-3">
        <img
          src={order.dropImage}
          alt={order.dropName}
          className="w-20 h-20 object-cover rounded-xl shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold line-clamp-2 mb-1">{order.dropName}</p>
          <p className="text-xs text-muted-foreground mb-2">사이즈 {order.size}mm</p>
          <p className="text-base font-bold text-red-600">₩{order.price.toLocaleString()}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground self-center shrink-0" />
      </div>

      {/* 배송 진행 단계 */}
      <div className="px-4 pb-4">
        <StepTracker currentIdx={stepIdx} />
        <div className="mt-3 space-y-0.5 text-xs text-muted-foreground text-left">
          <p>주문일: {order.orderDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          {order.trackingNumber && (
            <p>송장번호: <span className="font-mono">{order.trackingNumber}</span></p>
          )}
        </div>
      </div>
    </button>
  )
}

function StepTracker({ currentIdx }: { currentIdx: number }) {
  const labels = ['결제 완료', '배송 준비', '배송 중', '배송 완료']
  return (
    <div className="flex items-center">
      {labels.map((label, i) => {
        const done = i <= currentIdx
        const last = i === labels.length - 1
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {i + 1}
              </div>
              <span className={cn('text-[10px] whitespace-nowrap', done ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                {label}
              </span>
            </div>
            {!last && (
              <div className={cn('flex-1 h-px mx-1 mb-4 transition-colors', i < currentIdx ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function EmptyOrders({ onGoHome }: { onGoHome: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
      <Package className="w-16 h-16 opacity-20 mb-4" />
      <p className="text-sm mb-4">주문 내역이 없습니다</p>
      <button onClick={onGoHome} className="text-sm text-primary font-medium underline underline-offset-4">
        드랍 보러 가기
      </button>
    </div>
  )
}

