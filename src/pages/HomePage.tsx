import { useState, useEffect } from 'react'
import { Search, ShoppingBag, Home, Package, User, Flame, CalendarClock, Bell } from 'lucide-react'
import { DropCard } from '@/components/DropCard'
import { Button } from '@/components/ui/button'
import { mockDrops } from '@/data/mockData'
import { cn } from '@/lib/utils'
import type { Drop } from '@/types'

const BRANDS = ['전체', 'Nike', 'Adidas', 'New Balance', 'Converse']

export function HomePage() {
  const [selectedBrand, setSelectedBrand] = useState('전체')
  const [searchQuery, setSearchQuery] = useState('')

  const liveDrops = mockDrops.filter((d) => d.status === 'live')
  const upcomingDrops = mockDrops
    .filter((d) => d.status === 'upcoming')
    .sort((a, b) => a.dropDate.getTime() - b.dropDate.getTime())

  const filteredDrops = mockDrops.filter((drop) => {
    const matchesBrand = selectedBrand === '전체' || drop.brand === selectedBrand
    const matchesSearch =
      searchQuery === '' ||
      drop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drop.brand.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesBrand && matchesSearch
  })

  const handleDropClick = (_drop: Drop) => {
    // 상세 모달 — 추후 구현
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-500" />
            <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              DROPZONE
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="브랜드, 모델명 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-9 rounded-lg bg-muted text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 pb-24 md:pb-8">
        {/* Mobile Search */}
        <div className="md:hidden pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="브랜드, 모델명 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-10 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Hero Banner — Live Drops */}
        {liveDrops.length > 0 && (
          <section className="py-4 md:py-6">
            <div className="relative rounded-2xl overflow-hidden bg-black h-48 md:h-72">
              <img
                src={liveDrops[0].image}
                alt={liveDrops[0].name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8">
                <div className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-2 animate-pulse">
                  <Flame className="w-3 h-3" />
                  LIVE NOW
                </div>
                <h1 className="text-white text-xl md:text-3xl font-extrabold mb-1 drop-shadow-lg">
                  {liveDrops[0].name}
                </h1>
                <p className="text-white/80 text-sm mb-3">
                  {liveDrops[0].brand} · ₩{liveDrops[0].price.toLocaleString()}
                </p>
                <Button className="w-fit text-sm" onClick={() => handleDropClick(liveDrops[0])}>
                  지금 응모하기
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Upcoming Drops */}
        {upcomingDrops.length > 0 && (
          <section className="py-2 md:py-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-base font-bold">예정된 드랍</h2>
              <span className="text-sm font-normal text-muted-foreground">{upcomingDrops.length}개</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {upcomingDrops.map((drop) => (
                <UpcomingDropCard key={drop.id} drop={drop} onClick={() => handleDropClick(drop)} />
              ))}
            </div>
          </section>
        )}

        {/* Brand Filter */}
        <section className="py-2 md:py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {BRANDS.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={cn(
                  'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                  selectedBrand === brand
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {brand}
              </button>
            ))}
          </div>
        </section>

        {/* Section Title */}
        <section className="py-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-bold">
              {selectedBrand === '전체' ? '전체 드랍' : `${selectedBrand} 드랍`}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {filteredDrops.length}개
              </span>
            </h2>
          </div>

          {filteredDrops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Search className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredDrops.map((drop) => (
                <DropCard key={drop.id} drop={drop} onClick={() => handleDropClick(drop)} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
        <div className="flex items-center justify-around h-16">
          <NavItem icon={<Home className="w-5 h-5" />} label="홈" active />
          <NavItem icon={<Flame className="w-5 h-5" />} label="드랍" />
          <NavItem icon={<Package className="w-5 h-5" />} label="주문" />
          <NavItem icon={<User className="w-5 h-5" />} label="마이" />
        </div>
      </nav>
    </div>
  )
}

function UpcomingDropCard({ drop, onClick }: { drop: Drop; onClick: () => void }) {
  const calc = () => {
    const diff = drop.dropDate.getTime() - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    }
  }
  const [t, setT] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
  }, [drop.dropDate])

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-52 md:w-60 rounded-xl border border-border bg-card overflow-hidden text-left transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95"
    >
      <div className="relative h-32 bg-gray-100 overflow-hidden">
        <img src={drop.image} alt={drop.name} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          {t.days > 0 ? (
            <div className="flex gap-1.5">
              <CountdownUnit value={t.days} label="일" />
              <CountdownUnit value={t.hours} label="시" />
              <CountdownUnit value={t.minutes} label="분" />
            </div>
          ) : (
            <div className="flex gap-1.5">
              <CountdownUnit value={t.hours} label="시" />
              <CountdownUnit value={t.minutes} label="분" />
              <CountdownUnit value={t.seconds} label="초" />
            </div>
          )}
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-muted-foreground mb-0.5">{drop.brand}</p>
        <p className="text-sm font-semibold line-clamp-1 mb-1">{drop.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">₩{drop.price.toLocaleString()}</span>
          <button
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Bell className="w-3 h-3" />
            알림
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {drop.dropDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </button>
  )
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-black/50 backdrop-blur-sm rounded px-1.5 py-0.5 min-w-[32px]">
      <span className="text-white text-xs font-bold tabular-nums leading-none">{String(value).padStart(2, '0')}</span>
      <span className="text-white/70 text-[9px] leading-none mt-0.5">{label}</span>
    </div>
  )
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={cn(
        'flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors',
        active ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
