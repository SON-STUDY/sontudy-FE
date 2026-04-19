import { useState, useEffect, useCallback } from 'react'
import { X, Bookmark, Package, Clock, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePickList } from '@/hooks/usePickList'
import type { Drop } from '@/types'
import { cn } from '@/lib/utils'

interface DropDetailModalProps {
  drop: Drop
  onClose: () => void
  onPurchase: (dropId: string, size: string) => void
}

function useCountdownText(dropDate: Date) {
  const calc = useCallback(() => {
    const diff = dropDate.getTime() - Date.now()
    if (diff <= 0) return null
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    return { days, hours, minutes, seconds }
  }, [dropDate])

  const [t, setT] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
  }, [calc])
  return t
}

export function DropDetailModal({ drop, onClose, onPurchase }: DropDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const remaining = useCountdownText(drop.dropDate)
  const isLive = drop.status === 'live' || remaining === null
  const { ids, toggle } = usePickList()
  const isPicked = ids.includes(drop.id)

  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handlePurchase = () => {
    if (selectedSize) onPurchase(drop.id, selectedSize)
  }

  const formatCountdown = () => {
    if (!remaining) return '🔥 드롭 진행중!'
    const { days, hours, minutes, seconds } = remaining
    if (days > 0) return `${days}일 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-card w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl shadow-2xl">

        {/* 모바일 핸들 */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted" />
        </div>

        {/* 헤더 */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-bold">드롭 상세</h2>
          <div className="flex items-center gap-1">
            {drop.status === 'upcoming' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggle(drop.id)}
                className={cn(isPicked && 'text-primary')}
                title={isPicked ? '픽 리스트에서 제거' : '픽 리스트에 추가'}
              >
                <Bookmark className={cn('w-5 h-5', isPicked && 'fill-current')} />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-5">
          {/* 이미지 */}
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
            <img src={drop.image} alt={drop.name} className="w-full h-full object-cover" />
          </div>

          {/* 상품 정보 */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm text-muted-foreground">{drop.brand}</p>
              {drop.status === 'live' && (
                <Badge className="bg-red-600 text-white shrink-0">
                  <Flame className="w-3 h-3 mr-1" />LIVE
                </Badge>
              )}
              {drop.status === 'sold-out' && (
                <Badge variant="secondary" className="shrink-0">SOLD OUT</Badge>
              )}
            </div>
            <h3 className="text-xl font-bold mb-1">{drop.name}</h3>
            <p className="text-xl font-bold text-red-600">₩{drop.price.toLocaleString()}</p>
          </div>

          {/* 카운트다운 */}
          <div className={cn(
            'rounded-xl p-4',
            isLive ? 'bg-red-50' : 'bg-muted'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className={cn('w-4 h-4', isLive ? 'text-red-600' : 'text-muted-foreground')} />
              <span className="text-sm font-semibold">
                {isLive ? '🔥 드롭 진행중!' : '드롭까지 남은 시간'}
              </span>
            </div>
            {!isLive && (
              <>
                <p className="text-2xl font-bold text-red-600 tabular-nums">
                  {formatCountdown()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {drop.dropDate.toLocaleString('ko-KR', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </>
            )}
          </div>

          {/* 재고 현황 */}
          <div className="rounded-xl bg-muted p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">재고 현황</span>
            </div>
            <p className="text-sm text-muted-foreground">총 {drop.totalStock.toLocaleString()}켤레 한정</p>
          </div>

          {/* 사이즈 선택 */}
          <div>
            <h4 className="text-sm font-semibold mb-3">사이즈 선택</h4>
            <div className="grid grid-cols-3 gap-2">
              {drop.sizes.map((s) => {
                const outOfStock = s.stock === 0
                const selected = selectedSize === s.size
                return (
                  <button
                    key={s.size}
                    disabled={outOfStock || drop.status === 'sold-out'}
                    onClick={() => setSelectedSize(s.size)}
                    className={cn(
                      'py-3 px-2 border-2 rounded-xl transition-all text-center active:scale-95',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-foreground',
                      (outOfStock || drop.status === 'sold-out') && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <div className="text-sm font-semibold">{s.size}mm</div>
                    <div className="text-xs mt-0.5 opacity-70">
                      {s.stock > 0 ? `재고 ${s.stock}` : '품절'}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="pb-2">
            {drop.status === 'sold-out' ? (
              <Button className="w-full h-12 text-base" disabled>품절</Button>
            ) : isLive ? (
              <Button
                className="w-full h-12 text-base font-bold"
                disabled={!selectedSize}
                onClick={handlePurchase}
              >
                {selectedSize ? '구매하기' : '사이즈를 선택하세요'}
              </Button>
            ) : (
              <Button variant="outline" className="w-full h-12 text-base">
                <Bell className="w-4 h-4 mr-2" />
                드롭 알림 받기
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
