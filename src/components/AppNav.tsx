import { Flame, Home, ReceiptText, ShoppingBag, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePickList } from '@/hooks/usePickList'
import type { Page } from '@/types'

type SimplePage = 'home' | 'orders' | 'mypage' | 'cart'

interface AppHeaderProps {
  currentPage: SimplePage
  onNavigate: (page: Page) => void
  searchSlot?: React.ReactNode
  cartDisabled?: boolean
}

export function AppHeader({ currentPage, onNavigate, searchSlot, cartDisabled }: AppHeaderProps) {
  const { ids } = usePickList()
  const pickCount = ids.length

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* 로고 */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 shrink-0"
        >
          <Flame className="w-6 h-6 text-red-500" />
          <span className="font-bold text-lg tracking-tight hidden sm:block" style={{ fontFamily: 'var(--font-heading)' }}>
            DROPZONE
          </span>
        </button>

        {/* 검색 슬롯 */}
        {searchSlot && (
          <div className="hidden md:flex flex-1 max-w-sm">{searchSlot}</div>
        )}

        {/* 우측 액션 */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('orders')}
            className={cn(currentPage === 'orders' && 'text-primary')}
            title="주문 내역"
          >
            <ReceiptText className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('cart')}
            disabled={cartDisabled}
            className={cn('relative', currentPage === 'cart' && 'text-primary')}
            title="픽 리스트"
          >
            <ShoppingBag className="w-5 h-5" />
            {pickCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
                {pickCount > 9 ? '9+' : pickCount}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('mypage')}
            className={cn(currentPage === 'mypage' && 'text-primary')}
            title="마이페이지"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

interface AppBottomNavProps {
  currentPage: SimplePage
  onNavigate: (page: Page) => void
}

export function AppBottomNav({ currentPage, onNavigate }: AppBottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
      <div className="flex items-center justify-around h-16">
        <BottomNavItem
          icon={<Home className="w-5 h-5" />}
          label="홈"
          active={currentPage === 'home'}
          onClick={() => onNavigate('home')}
        />
        <BottomNavItem
          icon={<ReceiptText className="w-5 h-5" />}
          label="주문"
          active={currentPage === 'orders'}
          onClick={() => onNavigate('orders')}
        />
        <BottomNavItem
          icon={<User className="w-5 h-5" />}
          label="마이"
          active={currentPage === 'mypage'}
          onClick={() => onNavigate('mypage')}
        />
      </div>
    </nav>
  )
}

function BottomNavItem({
  icon, label, active, onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 flex-1 py-2 text-xs font-medium transition-colors',
        active ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
