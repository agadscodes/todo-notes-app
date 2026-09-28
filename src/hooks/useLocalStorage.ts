import { useEffect, useState } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  normalize: (storedValue: T) => T = (storedValue) => storedValue,
) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return normalize(initialValue)
    }

    try {
      const raw = window.localStorage.getItem(key)
      return normalize(raw ? (JSON.parse(raw) as T) : initialValue)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore storage errors and keep state in memory.
    }
  }, [key, value])

  return [value, setValue] as const
}
