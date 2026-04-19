import { useState, useEffect } from 'react'
import { getOrders } from '@/api/orders'
import type { Order } from '@/types'

export function useOrders() {
  const [data, setData] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsLoading(true)
    getOrders()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setIsLoading(false))
  }, [])

  return { data, isLoading, error }
}
