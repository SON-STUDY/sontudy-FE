import { useState, useEffect } from 'react'
import { getDrops } from '@/api/drops'
import type { Drop } from '@/types'

export function useDrops() {
  const [data, setData] = useState<Drop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsLoading(true)
    getDrops()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setIsLoading(false))
  }, [])

  return { data, isLoading, error }
}
