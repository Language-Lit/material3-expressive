'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Overloaded function signatures
export function useDebounce<T>(value: T, delay: number): T
export function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number): T

export function useDebounce<T>(valueOrCallback: T, delay: number): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedValue, setDebouncedValue] = useState(valueOrCallback)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (typeof valueOrCallback === 'function') {
    const debouncedCallback = useCallback((...args: Parameters<any>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        (valueOrCallback as Function)(...args)
      }, delay)
    }, [valueOrCallback, delay]) as T

    return debouncedCallback
  } else {
    useEffect(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(valueOrCallback)
      }, delay)
    }, [valueOrCallback, delay])

    return debouncedValue
  }
}
