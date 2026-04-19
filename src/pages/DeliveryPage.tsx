import { useState } from 'react'
import {
  ChevronLeft, Package, Truck, CheckCircle, Clock,
  MapPin, Copy, Check, CalendarClock,
} from 'lucide-react'
import { useOrder } from '@/hooks/useOrder'
import { Skeleton } from '@/components/ui/skeleton'
import type { Order, Page } from '@/types'
import { cn } from '@/lib/utils'

interface DeliveryPageProps {
  orderId: string
  onNavigate: (page: Page) => void
}

const STATUS_STEPS: Order['status'][] = ['pending', 'confirmed', 'shipped', 'delivered']

const STEP_META: Record<Order['status'], { icon: React.ElementType; label: string }> = {
  pending:   { icon: Clock,       label: '결제 대기' },
  confirmed: { icon: Package,     label: '배송 준비' },
  shipped:   { icon: Truck,       label: '배송 중'   },
  delivered: { icon: CheckCircle, label: '배송 완료' },
}

export function DeliveryPage({ orderId, onNavigate }: DeliveryPageProps) {
  const { data: order, isLoading, error } = useOrder(orderId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-screen-md mx-auto px-4 py-5 space-y-4">
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Package className="w-16 h-16 opacity-20" />
        <p className="text-sm">{error?.message ?? '주문을 찾을 수 없습니다.'}</p>
        <button className="text-sm text-primary underline underline-offset-4" onClick={() => onNavigate('orders')}>
          주문 목록으로
        </button>
      </div>
    )
  }

  const stepIdx = STATUS_STEPS.indexOf(order.status)
  const events = order.shippingEvents ?? []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center gap-2">
          <button
            onClick={() => onNavigate('orders')}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold">배송 조회</h1>
        </div>
      </header>

      <main className="flex-1 max-w-screen-md mx-auto w-full px-4 py-5 pb-10 space-y-4">

        {/* 상품 요약 */}
        <section className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex gap-4 p-4">
            <img
              src={order.dropImage}
              alt={order.dropName}
              className="w-20 h-20 object-cover rounded-xl shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">{order.id}</p>
              <p className="text-sm font-semibold line-clamp-2 mb-1">{order.dropName}</p>
              <p className="text-xs text-muted-foreground">사이즈 {order.size}mm</p>
              <p className="text-base font-bold mt-1">₩{order.price.toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* 배송 상태 스텝 */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-bold mb-4">배송 현황</h2>
          <div className="flex items-start">
            {STATUS_STEPS.map((status, i) => {
              const { icon: Icon, label } = STEP_META[status]
              const done = i <= stepIdx
              const active = i === stepIdx
              const last = i === STATUS_STEPS.length - 1
              return (
                <div key={status} className="flex items-start flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
                      active ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : done ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={cn(
                      'text-[10px] text-center leading-tight whitespace-nowrap',
                      done ? 'text-foreground font-semibold' : 'text-muted-foreground'
                    )}>
                      {label}
                    </span>
                  </div>
                  {!last && (
                    <div className={cn(
                      'flex-1 h-0.5 mx-1 mt-[18px] transition-colors',
                      i < stepIdx ? 'bg-primary' : 'bg-border'
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* 택배사·운송장 */}
        {(order.trackingNumber || order.courier) && (
          <section className="rounded-2xl border border-border bg-card divide-y divide-border">
            {order.courier && (
              <InfoRow label="택배사" value={order.courier} />
            )}
            {order.trackingNumber && (
              <InfoRow label="운송장 번호" value={order.trackingNumber} copyable />
            )}
            {order.estimatedDelivery && (
              <InfoRow
                label="배송 예정일"
                value={order.estimatedDelivery.toLocaleDateString('ko-KR', {
                  month: 'long', day: 'numeric', weekday: 'short',
                })}
                icon={<CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />}
              />
            )}
          </section>
        )}

        {/* 배송지 */}
        {order.deliveryAddress && (
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">배송지</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{order.deliveryAddress}</p>
          </section>
        )}

        {/* 배송 이벤트 타임라인 */}
        {events.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-sm font-bold mb-4">배송 내역</h2>
            <div className="relative">
              {/* 세로 선 */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
              <ul className="space-y-5">
                {events.map((event, i) => {
                  const isLatest = i === 0
                  return (
                    <li key={i} className="flex gap-4 relative">
                      <div className={cn(
                        'w-3.5 h-3.5 rounded-full border-2 shrink-0 mt-0.5 z-10',
                        isLatest
                          ? 'bg-primary border-primary'
                          : 'bg-background border-border'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-semibold', isLatest ? 'text-primary' : 'text-foreground')}>
                          {event.status}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{event.location}</span>
                          <span>·</span>
                          <span>{formatEventTime(event.timestamp)}</span>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function InfoRow({
  label, value, copyable, icon,
}: {
  label: string
  value: string
  copyable?: boolean
  icon?: React.ReactNode
}) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium font-mono">{value}</span>
        {copyable && (
          <button
            onClick={copy}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  )
}

function formatEventTime(date: Date) {
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
