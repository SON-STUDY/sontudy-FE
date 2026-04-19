import { useState, useEffect } from 'react'
import { Clock, Bookmark } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePickList } from '@/hooks/usePickList'
import { cn } from '@/lib/utils'
import type { Drop } from '@/types'

interface DropCardProps {
  drop: Drop
  onClick: () => void
}

function useCountdown(targetDate: Date) {
  const calc = () => {
    const diff = targetDate.getTime() - Date.now()
    if (diff <= 0) return null
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    }
  }

  const [remaining, setRemaining] = useState(calc)

  useEffect(() => {
    const timer = setInterval(() => setRemaining(calc()), 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return remaining
}

function StatusBadge({ drop }: { drop: Drop }) {
  const remaining = useCountdown(drop.dropDate)

  if (drop.status === 'sold-out') {
    return <Badge variant="secondary">SOLD OUT</Badge>
  }

  if (drop.status === 'live' || !remaining) {
    return <Badge className="bg-red-600 hover:bg-red-700 text-white">🔥 LIVE</Badge>
  }

  if (remaining.days > 0) {
    return <Badge variant="outline">D-{remaining.days}</Badge>
  }

  const hm = `${String(remaining.hours).padStart(2, '0')}:${String(remaining.minutes).padStart(2, '0')}:${String(remaining.seconds).padStart(2, '0')}`
  return <Badge variant="outline">{hm}</Badge>
}

export function DropCard({ drop, onClick }: DropCardProps) {
  const { ids, toggle } = usePickList()
  const isPicked = ids.includes(drop.id)

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-95"
      onClick={onClick}
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={drop.image}
          alt={drop.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <StatusBadge drop={drop} />
        </div>
        {drop.status === 'sold-out' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-lg tracking-widest">SOLD OUT</span>
          </div>
        )}
      </div>
      <CardContent className="p-3 md:p-4">
        <p className="text-xs md:text-sm text-muted-foreground mb-0.5">{drop.brand}</p>
        <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-1">{drop.name}</h3>
        <div className="flex items-center justify-between mb-2">
          <p className="text-base md:text-lg font-bold">₩{drop.price.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="hidden sm:inline">
              {drop.dropDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="sm:hidden">
              {drop.dropDate.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>재고 {drop.totalStock.toLocaleString()}켤레</span>
          {drop.status === 'upcoming' && (
            <Button
              size="sm"
              variant="ghost"
              className={cn('h-7 px-2 text-xs', isPicked && 'text-primary')}
              onClick={(e) => { e.stopPropagation(); toggle(drop.id) }}
              title={isPicked ? '픽 리스트에서 제거' : '픽 리스트에 추가'}
            >
              <Bookmark className={cn('w-3 h-3 mr-1', isPicked && 'fill-current')} />
              {isPicked ? '픽됨' : '픽'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
