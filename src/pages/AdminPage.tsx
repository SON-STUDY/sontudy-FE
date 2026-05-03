import { useState, useEffect } from 'react'
import {
  ChevronLeft, CheckCircle, XCircle, Loader2, Plus, Trash2,
  Package, Truck, Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getSellerApplications, reviewSellerApplication,
  registerProduct, registerShipment,
  type SellerApplication, type ProductOption, type ProductCategory,
} from '@/api/admin'
import { cn } from '@/lib/utils'
import type { Page } from '@/types'

interface AdminPageProps {
  onNavigate: (page: Page) => void
}

type Tab = 'sellers' | 'shipment' | 'product'

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'sellers',  label: '판매자 신청', icon: Users   },
  { key: 'shipment', label: '배송 등록',   icon: Truck   },
  { key: 'product',  label: '상품 등록',   icon: Package },
]

const CATEGORIES: ProductCategory[] = ['SNEAKERS', 'LOAFERS', 'SANDALS', 'BOOTS', 'ETC']
const CATEGORY_LABELS: Record<ProductCategory, string> = {
  SNEAKERS: '스니커즈',
  LOAFERS: '로퍼',
  SANDALS: '샌들',
  BOOTS: '부츠',
  ETC: '기타',
}

export function AdminPage({ onNavigate }: AdminPageProps) {
  const [tab, setTab] = useState<Tab>('sellers')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-screen-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => onNavigate('mypage')}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold">관리자 페이지</h1>
        </div>

        {/* 탭 */}
        <div className="max-w-screen-lg mx-auto px-4 flex gap-1 pb-0">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                tab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-screen-lg mx-auto w-full px-4 py-6">
        {tab === 'sellers'  && <SellerApplicationsTab />}
        {tab === 'shipment' && <ShipmentTab />}
        {tab === 'product'  && <ProductRegistrationTab />}
      </main>
    </div>
  )
}

// ─── 판매자 신청 관리 ──────────────────────────────────────────────────────────

function SellerApplicationsTab() {
  const [applications, setApplications] = useState<SellerApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const load = () => {
    setIsLoading(true)
    setError(null)
    getSellerApplications()
      .then(setApplications)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : '불러오기 실패'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [])

  const handle = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id)
    try {
      await reviewSellerApplication(id, status)
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      )
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '처리 실패')
    } finally {
      setProcessingId(null)
    }
  }

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
  }

  if (error) {
    return <ErrorBox message={error} onRetry={load} />
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Users className="w-12 h-12 opacity-20 mb-3" />
        <p className="text-sm">대기 중인 판매자 신청이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => {
        const isPending = app.status === 'PENDING'
        const isProcessing = processingId === app.id
        return (
          <div
            key={app.id}
            className="rounded-xl border border-border bg-card p-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-sm">{app.userName}</span>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-xs text-muted-foreground font-mono">{app.userId}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                신청일: {new Date(app.appliedAt).toLocaleDateString('ko-KR', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>

            {isPending && (
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-700 border-green-200 hover:bg-green-50"
                  disabled={isProcessing}
                  onClick={() => handle(app.id, 'APPROVED')}
                >
                  {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                  <span className="ml-1">승인</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/5"
                  disabled={isProcessing}
                  onClick={() => handle(app.id, 'REJECTED')}
                >
                  {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                  <span className="ml-1">반려</span>
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function StatusBadge({ status }: { status: SellerApplication['status'] }) {
  const meta = {
    PENDING:  { label: '대기',  cls: 'bg-yellow-100 text-yellow-700' },
    APPROVED: { label: '승인',  cls: 'bg-green-100  text-green-700'  },
    REJECTED: { label: '반려',  cls: 'bg-red-100    text-red-700'    },
  }[status]
  return (
    <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', meta.cls)}>
      {meta.label}
    </span>
  )
}

// ─── 배송 정보 등록 ───────────────────────────────────────────────────────────

function ShipmentTab() {
  const [orderId, setOrderId]               = useState('')
  const [courierCompany, setCourierCompany] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [isLoading, setIsLoading]           = useState(false)
  const [result, setResult]                 = useState<{ ok: boolean; msg: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)
    try {
      await registerShipment(orderId.trim(), {
        courierCompany: courierCompany.trim(),
        trackingNumber: trackingNumber.trim(),
      })
      setResult({ ok: true, msg: '배송 정보가 등록되었습니다.' })
      setOrderId(''); setCourierCompany(''); setTrackingNumber('')
    } catch (e: unknown) {
      setResult({ ok: false, msg: e instanceof Error ? e.message : '등록 실패' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md space-y-5">
      <p className="text-sm text-muted-foreground">주문 ID와 택배 정보를 입력해 출고 처리합니다.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField id="orderId" label="주문 ID" placeholder="ord-xxxxxxxx" value={orderId} onChange={setOrderId} required />
        <FormField id="courier" label="택배사" placeholder="CJ대한통운" value={courierCompany} onChange={setCourierCompany} required />
        <FormField id="tracking" label="송장번호" placeholder="1234567890" value={trackingNumber} onChange={setTrackingNumber} required />

        {result && (
          <p className={cn('text-sm rounded-lg px-3 py-2', result.ok ? 'bg-green-50 text-green-700' : 'bg-destructive/10 text-destructive')}>
            {result.msg}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />처리 중...</> : '배송 등록'}
        </Button>
      </form>
    </div>
  )
}

// ─── 상품 등록 ────────────────────────────────────────────────────────────────

interface OptionRow extends ProductOption {
  _key: number
}

function ProductRegistrationTab() {
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [brand, setBrand]             = useState('')
  const [colorName, setColorName]     = useState('')
  const [colorHex, setColorHex]       = useState('#000000')
  const [imageUrl, setImageUrl]       = useState('')
  const [imageUrls, setImageUrls]     = useState<string[]>([])
  const [releasedAt, setReleasedAt]   = useState('')
  const [category, setCategory]       = useState<ProductCategory>('SNEAKERS')
  const [options, setOptions]         = useState<OptionRow[]>([{ _key: 0, size: 260, cost: 0, stock: 10 }])
  const [isLoading, setIsLoading]     = useState(false)
  const [result, setResult]           = useState<{ ok: boolean; msg: string } | null>(null)

  const addImage = () => {
    const url = imageUrl.trim()
    if (!url) return
    setImageUrls((prev) => [...prev, url])
    setImageUrl('')
  }

  const removeImage = (i: number) =>
    setImageUrls((prev) => prev.filter((_, idx) => idx !== i))

  const addOption = () =>
    setOptions((prev) => [...prev, { _key: Date.now(), size: 260, cost: 0, stock: 10 }])

  const removeOption = (key: number) =>
    setOptions((prev) => prev.filter((o) => o._key !== key))

  const updateOption = (key: number, field: keyof ProductOption, value: number) =>
    setOptions((prev) => prev.map((o) => o._key === key ? { ...o, [field]: value } : o))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (imageUrls.length === 0) {
      setResult({ ok: false, msg: '이미지 URL을 최소 1개 추가하세요.' })
      return
    }
    setIsLoading(true)
    setResult(null)
    try {
      await registerProduct({
        name, description, brand, colorName,
        colorHexCode: colorHex,
        imageUrls,
        releasedAt: new Date(releasedAt).toISOString(),
        category,
        options: options.map(({ size, cost, stock }) => ({ size, cost, stock })),
      })
      setResult({ ok: true, msg: '상품이 등록되었습니다.' })
      // 폼 초기화
      setName(''); setDescription(''); setBrand(''); setColorName('')
      setColorHex('#000000'); setImageUrls([]); setReleasedAt('')
      setCategory('SNEAKERS'); setOptions([{ _key: Date.now(), size: 260, cost: 0, stock: 10 }])
    } catch (e: unknown) {
      setResult({ ok: false, msg: e instanceof Error ? e.message : '등록 실패' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* 기본 정보 */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">기본 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="p-name"  label="상품명"  placeholder="Nike Air Max 90" value={name}  onChange={setName}  required />
          <FormField id="p-brand" label="브랜드"  placeholder="Nike"             value={brand} onChange={setBrand} required />
        </div>
        <div>
          <Label htmlFor="p-desc">상품 설명</Label>
          <textarea
            id="p-desc"
            rows={3}
            placeholder="상품에 대한 설명을 입력하세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
      </section>

      {/* 색상 */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">색상</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="p-color-name" label="색상명" placeholder="Triple Black" value={colorName} onChange={setColorName} required />
          <div className="space-y-1.5">
            <Label htmlFor="p-color-hex">색상 코드</Label>
            <div className="flex gap-2">
              <Input
                id="p-color-hex"
                type="text"
                placeholder="#000000"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                required
                className="flex-1 font-mono"
              />
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-10 h-10 rounded-lg border border-input cursor-pointer p-1"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 이미지 */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">이미지 URL</h2>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage() }}}
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addImage}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {imageUrls.length > 0 && (
          <ul className="space-y-1.5">
            {imageUrls.map((url, i) => (
              <li key={i} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <img src={url} alt="" className="w-8 h-8 object-cover rounded shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <span className="flex-1 text-xs font-mono truncate">{url}</span>
                <button type="button" onClick={() => removeImage(i)} className="text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 출시일 & 카테고리 */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">출시 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-released">드랍 일시</Label>
            <Input
              id="p-released"
              type="datetime-local"
              value={releasedAt}
              onChange={(e) => setReleasedAt(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>카테고리</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                    category === c
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-foreground/40'
                  )}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 옵션 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">사이즈 옵션</h2>
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            <Plus className="w-3.5 h-3.5 mr-1" />옵션 추가
          </Button>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-xs">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">사이즈 (mm)</th>
                <th className="text-left px-4 py-2.5 font-medium">가격 (원)</th>
                <th className="text-left px-4 py-2.5 font-medium">재고 (개)</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {options.map((opt) => (
                <tr key={opt._key}>
                  <td className="px-3 py-2">
                    <Input
                      type="number" min={0}
                      value={opt.size}
                      onChange={(e) => updateOption(opt._key, 'size', Number(e.target.value))}
                      className="h-8 w-24"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number" min={0}
                      value={opt.cost}
                      onChange={(e) => updateOption(opt._key, 'cost', Number(e.target.value))}
                      className="h-8 w-32"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number" min={0}
                      value={opt.stock}
                      onChange={(e) => updateOption(opt._key, 'stock', Number(e.target.value))}
                      className="h-8 w-24"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removeOption(opt._key)}
                      disabled={options.length === 1}
                      className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {result && (
        <p className={cn('text-sm rounded-lg px-3 py-2', result.ok ? 'bg-green-50 text-green-700' : 'bg-destructive/10 text-destructive')}>
          {result.msg}
        </p>
      )}

      <Button type="submit" className="w-full h-11 font-bold" disabled={isLoading}>
        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />등록 중...</> : '상품 등록'}
      </Button>
    </form>
  )
}

// ─── 공통 컴포넌트 ─────────────────────────────────────────────────────────────

function FormField({
  id, label, placeholder, value, onChange, required,
}: {
  id: string; label: string; placeholder: string
  value: string; onChange: (v: string) => void; required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  )
}

function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
      <p className="text-sm text-destructive">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>다시 시도</Button>
    </div>
  )
}
