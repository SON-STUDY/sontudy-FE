import { useState } from 'react'
import { createOrder } from '@/api/orders'
import type { CreateOrderPayload } from '@/api/orders'
import type { Order } from '@/types'

export function useCreateOrder() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = async (payload: CreateOrderPayload): Promise<Order | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const order = await createOrder(payload)
      return order
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading, error }
}
