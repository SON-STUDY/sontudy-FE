import { useState, useEffect } from 'react'
import { X, CreditCard, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateOrder } from '@/hooks/useCreateOrder'
import type { CreateOrderPayload } from '@/api/orders'
import type { Drop } from '@/types'
import { cn } from '@/lib/utils'

interface PurchaseModalProps {
  drop: Drop
  size: string
  onClose: () => void
  onBack: () => void
  onNavigateToOrders: () => void
}

const DELIVERY_FEE = 3000

const PAYMENT_METHODS: { value: CreateOrderPayload['paymentMethod']; label: string }[] = [
  { value: 'CARD', label: '신용/체크카드' },
  { value: 'SIMPLE_PAY', label: '간편결제' },
  { value: 'ACCOUNT_TRANSFER', label: '계좌이체' },
  { value: 'VIRTUAL_ACCOUNT', label: '가상계좌' },
]

export function PurchaseModal({ drop, size, onClose, onBack, onNavigateToOrders }: PurchaseModalProps) {
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<CreateOrderPayload['paymentMethod']>('CARD')
  const { mutate, isLoading, error } = useCreateOrder()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const option = drop.sizes.find((s) => s.size === size)
  const unitPrice = option?.stock != null ? (drop.sizes.find(s => s.size === size) ? drop.price : 0) : drop.price
  const total = unitPrice + DELIVERY_FEE

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!option?.optionId) return

    const order = await mutate({
      productOptionId: option.optionId,
      paymentMethod,
      amount: total,
      size,
      address,
      phone,
    })
    if (order) {
      onClose()
      onNavigateToOrders()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card w-full max-w-md max-h-[95vh] md:max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl shadow-2xl">

        {/* 모바일 핸들 */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted" />
        </div>

        {/* 헤더 */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-base font-bold">주문하기</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5">
          {/* 상품 요약 */}
          <div className="flex gap-3 bg-muted rounded-xl p-3">
            <img src={drop.image} alt={drop.name} className="w-16 h-16 object-cover rounded-lg shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{drop.brand}</p>
              <p className="text-sm font-semibold line-clamp-1">{drop.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">사이즈 {size}mm</p>
            </div>
          </div>

          {/* 결제 수단 */}
          <div className="space-y-2">
            <Label>결제 수단</Label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => setPaymentMethod(pm.value)}
                  className={cn(
                    'py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all',
                    paymentMethod === pm.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-foreground/40'
                  )}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* 배송 정보 */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="address">배송지</Label>
              <Input
                id="address"
                type="text"
                placeholder="배송받을 주소를 입력하세요"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">연락처</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 금액 요약 */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>상품 가격</span>
              <span>₩{drop.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>배송비</span>
              <span>₩{DELIVERY_FEE.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-border pt-2">
              <span>총 결제금액</span>
              <span className="text-red-600">₩{total.toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error.message}</p>
          )}

          {/* 결제 버튼 */}
          <div className="pb-2 space-y-2">
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold"
              disabled={isLoading || !option?.optionId}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isLoading ? '처리 중...' : '결제하기'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              결제 완료 시 재고가 확정 차감됩니다
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
