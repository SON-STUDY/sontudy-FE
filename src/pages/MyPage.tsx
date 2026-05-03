import { useState } from 'react'
import {
  ChevronRight, ReceiptText, Bell, Settings,
  HeadphonesIcon, LogOut, User as UserIcon, Store, ShieldCheck,
} from 'lucide-react'
import { AppHeader, AppBottomNav } from '@/components/AppNav'
import { Skeleton } from '@/components/ui/skeleton'
import { useMe } from '@/hooks/useMe'
import { useOrders } from '@/hooks/useOrders'
import { applyForSeller } from '@/api/user'
import { clearToken } from '@/lib/auth'
import { cn } from '@/lib/utils'
import type { Page } from '@/types'

interface MyPageProps {
  onNavigate: (page: Page) => void
}

export function MyPage({ onNavigate }: MyPageProps) {
  const { data: user, isLoading: userLoading } = useMe()
  const { data: orders } = useOrders()
  const [sellerApplying, setSellerApplying] = useState(false)
  const [sellerMsg, setSellerMsg] = useState<string | null>(null)

  const handleLogout = () => {
    clearToken()
    onNavigate('login')
  }

  const handleSellerApply = async () => {
    setSellerApplying(true)
    setSellerMsg(null)
    try {
      await applyForSeller()
      setSellerMsg('판매자 신청이 완료되었습니다.')
    } catch (err: unknown) {
      setSellerMsg(err instanceof Error ? err.message : '신청에 실패했습니다')
    } finally {
      setSellerApplying(false)
    }
  }

  const stats = {
    total: orders.length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader currentPage="mypage" onNavigate={onNavigate} />

      <main className="flex-1 max-w-screen-md mx-auto w-full px-4 py-5 pb-24 md:pb-10 space-y-4">

        {/* 프로필 카드 */}
        {userLoading ? (
          <Skeleton className="h-28 rounded-2xl" />
        ) : user ? (
          <section className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg leading-tight">{user.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {user.joinedAt.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })} 가입
              </p>
            </div>
            <button className="text-xs text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors shrink-0">
              편집
            </button>
          </section>
        ) : null}

        {/* 주문 통계 */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { label: '전체 주문', value: stats.total },
            { label: '배송 중',   value: stats.shipped },
            { label: '배송 완료', value: stats.delivered },
          ].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => onNavigate('orders')}
              className="rounded-xl border border-border bg-card py-4 flex flex-col items-center gap-1 hover:bg-muted transition-colors"
            >
              <span className="text-2xl font-bold">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </button>
          ))}
        </section>

        {/* 메뉴 목록 */}
        <section className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
          <MenuItem
            icon={<ReceiptText className="w-4 h-4" />}
            label="주문 내역"
            onClick={() => onNavigate('orders')}
          />
          <MenuItem
            icon={<Bell className="w-4 h-4" />}
            label="알림 설정"
            right={<NotificationToggle defaultOn={user?.notificationsEnabled ?? true} />}
          />
          <MenuItem
            icon={<Store className="w-4 h-4" />}
            label={sellerApplying ? '신청 중...' : '판매자 신청'}
            onClick={handleSellerApply}
          />
          <MenuItem
            icon={<Settings className="w-4 h-4" />}
            label="계정 설정"
          />
          <MenuItem
            icon={<HeadphonesIcon className="w-4 h-4" />}
            label="고객센터"
          />
        </section>

        {sellerMsg && (
          <p className="text-sm text-center text-muted-foreground px-2">{sellerMsg}</p>
        )}

        {user?.role === 'ADMIN' && (
          <section className="rounded-2xl border border-primary/30 bg-primary/5 overflow-hidden">
            <MenuItem
              icon={<ShieldCheck className="w-4 h-4 text-primary" />}
              label="관리자 페이지"
              labelClass="text-primary font-semibold"
              onClick={() => onNavigate('admin')}
            />
          </section>
        )}

        <section className="rounded-2xl border border-border bg-card overflow-hidden">
          <MenuItem
            icon={<LogOut className="w-4 h-4 text-destructive" />}
            label="로그아웃"
            labelClass="text-destructive"
            onClick={handleLogout}
          />
        </section>

        <p className="text-center text-xs text-muted-foreground pt-2">
          DROPZONE v0.1.0
        </p>
      </main>

      <AppBottomNav currentPage="mypage" onNavigate={onNavigate} />
    </div>
  )
}

function MenuItem({
  icon, label, labelClass, onClick, right,
}: {
  icon: React.ReactNode
  label: string
  labelClass?: string
  onClick?: () => void
  right?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors',
        onClick ? 'hover:bg-muted' : 'cursor-default'
      )}
    >
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className={cn('flex-1 text-sm font-medium', labelClass)}>{label}</span>
      {right ?? (onClick && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />)}
    </button>
  )
}

function NotificationToggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      onClick={(e) => { e.stopPropagation(); setOn((v) => !v) }}
      className={cn(
        'relative w-10 h-6 rounded-full transition-colors shrink-0',
        on ? 'bg-primary' : 'bg-muted'
      )}
    >
      <span className={cn(
        'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
        on ? 'translate-x-5' : 'translate-x-1'
      )} />
    </button>
  )
}
