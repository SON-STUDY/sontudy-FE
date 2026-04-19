import { useState, useEffect } from 'react'
import { getMe } from '@/api/user'
import type { User } from '@/types'

export function useMe() {
  const [data, setData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsLoading(true)
    getMe()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setIsLoading(false))
  }, [])

  return { data, isLoading, error }
}
