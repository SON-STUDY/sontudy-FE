import { useState } from 'react'
import { ShoppingBag, Trash2, Flame } from 'lucide-react'
import { AppHeader, AppBottomNav } from '@/components/AppNav'
import { DropDetailModal } from '@/components/DropDetailModal'
import { PurchaseModal } from '@/components/PurchaseModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDrops } from '@/hooks/useDrops'
import { usePickList } from '@/hooks/usePickList'
import { cn } from '@/lib/utils'
import type { Drop, Page } from '@/types'

interface CartPageProps {
  onNavigate: (page: Page) => void
}

export function CartPage({ onNavigate }: CartPageProps) {
  const { data: drops, isLoading } = useDrops()
  const { ids, remove } = usePickList()
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null)
  const [purchaseInfo, setPurchaseInfo] = useState<{ drop: Drop; size: string } | null>(null)

  const pickedDrops = drops.filter((d) => ids.includes(d.id))

  const handlePurchase = (dropId: string, size: string) => {
    const drop = drops.find((d) => d.id === dropId)
    if (!drop) return
    setSelectedDrop(null)
    setPurchaseInfo({ drop, size })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader currentPage="cart" onNavigate={onNavigate} />

      <main className="flex-1 max-w-screen-md mx-auto w-full px-4 py-5 pb-24 md:pb-10">
        <h1 className="text-lg font-bold mb-4">픽 리스트</h1>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : pickedDrops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 opacity-20" />
            <p className="text-sm">픽한 드롭이 없어요.</p>
            <Button variant="outline" size="sm" onClick={() => onNavigate('home')}>
              드롭 보러가기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {pickedDrops.map((drop) => (
              <PickCard
                key={drop.id}
                drop={drop}
                onOpen={() => setSelectedDrop(drop)}
                onRemove={() => remove(drop.id)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedDrop && (
        <DropDetailModal
          drop={selectedDrop}
          onClose={() => setSelectedDrop(null)}
          onPurchase={handlePurchase}
        />
      )}
      {purchaseInfo && (
        <PurchaseModal
          drop={purchaseInfo.drop}
          size={purchaseInfo.size}
          onClose={() => setPurchaseInfo(null)}
          onBack={() => {
            const drop = purchaseInfo.drop
            setPurchaseInfo(null)
            setSelectedDrop(drop)
          }}
          onNavigateToOrders={() => onNavigate('orders')}
        />
      )}

      <AppBottomNav currentPage="cart" onNavigate={onNavigate} />
    </div>
  )
}

function PickCard({
  drop, onOpen, onRemove,
}: {
  drop: Drop
  onOpen: () => void
  onRemove: () => void
}) {
  const isLive = drop.status === 'live'
  const isSoldOut = drop.status === 'sold-out'

  return (
    <div className={cn(
      'flex gap-3 rounded-xl border border-border bg-card p-3',
      isLive && 'border-red-300 bg-red-50/30 dark:bg-red-950/20'
    )}>
      <button onClick={onOpen} className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
        <img src={drop.image} alt={drop.name} className="w-full h-full object-cover" />
      </button>

      <button className="flex-1 min-w-0 text-left" onClick={onOpen}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-xs text-muted-foreground">{drop.brand}</p>
          {isLive && (
            <Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0 h-4">
              <Flame className="w-2.5 h-2.5 mr-0.5" />LIVE
            </Badge>
          )}
          {isSoldOut && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">SOLD OUT</Badge>
          )}
        </div>
        <p className="text-sm font-semibold line-clamp-1 mb-1">{drop.name}</p>
        <p className="text-sm font-bold">₩{drop.price.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {drop.dropDate.toLocaleDateString('ko-KR', {
            month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </button>

      <div className="flex flex-col items-end justify-between shrink-0">
        <button
          onClick={onRemove}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
          title="픽 리스트에서 제거"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        {isLive && (
          <Button size="sm" className="text-xs h-7 px-2" onClick={onOpen}>
            구매하기
          </Button>
        )}
      </div>
    </div>
  )
}
