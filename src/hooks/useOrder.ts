import { useState, useEffect } from 'react'
import { getOrder } from '@/api/orders'
import type { Order } from '@/types'

export function useOrder(id: string) {
  const [data, setData] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsLoading(true)
    getOrder(id)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setIsLoading(false))
  }, [id])

  return { data, isLoading, error }
}
