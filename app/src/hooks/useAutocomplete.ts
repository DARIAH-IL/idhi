import { useEffect, useRef, useState } from 'react'
import { AUTOCOMPLETE_MAX_RESULTS } from '@/lib/autocomplete'

interface UseAutocompleteOptions<T> {
  search: (query: string, signal: AbortSignal) => Promise<T[]>
  shouldSearch?: (query: string) => boolean
  minQueryLength?: number
  debounceMs?: number
  maxResults?: number
}

export function useAutocomplete<T>({
  search,
  shouldSearch,
  minQueryLength = 3,
  debounceMs = 300,
  maxResults = AUTOCOMPLETE_MAX_RESULTS,
}: UseAutocompleteOptions<T>) {
  const [items, setItems] = useState<T[] | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const debounceRef = useRef<number | undefined>(undefined)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(
    () => () => {
      window.clearTimeout(debounceRef.current)
      abortRef.current?.abort()
    },
    [],
  )

  const reset = () => {
    window.clearTimeout(debounceRef.current)
    abortRef.current?.abort()
    setItems(undefined)
    setLoading(false)
    setError(false)
  }

  const handleQueryChange = (raw: string) => {
    window.clearTimeout(debounceRef.current)
    const query = raw.trim()
    if (query.length < minQueryLength || shouldSearch?.(query) === false) {
      reset()
      return
    }

    abortRef.current?.abort()
    setItems([])
    setLoading(true)
    setError(false)

    debounceRef.current = window.setTimeout(() => {
      const controller = new AbortController()
      abortRef.current = controller
      search(query, controller.signal)
        .then((results) => {
          if (controller.signal.aborted) {
            return
          }
          setItems(results.slice(0, maxResults))
          setLoading(false)
        })
        .catch(() => {
          if (controller.signal.aborted) {
            return
          }
          setItems(undefined)
          setLoading(false)
          setError(true)
        })
    }, debounceMs)
  }

  return { items, loading, error, handleQueryChange, reset }
}
