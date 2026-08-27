import { useEffect, useRef, useState } from 'react'

interface UseAutocompleteOptions<T> {
  search: (query: string, signal: AbortSignal) => Promise<T[]>
  shouldSearch?: (query: string) => boolean
  onPick: (item: T) => void
  minQueryLength?: number
  debounceMs?: number
  maxResults?: number
}

export function useAutocomplete<T>({
  search,
  shouldSearch,
  onPick,
  minQueryLength = 3,
  debounceMs = 300,
  maxResults = 5,
}: UseAutocompleteOptions<T>) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<T[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<number | undefined>(undefined)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(
    () => () => {
      window.clearTimeout(debounceRef.current)
      abortRef.current?.abort()
    },
    [],
  )

  const close = () => {
    window.clearTimeout(debounceRef.current)
    abortRef.current?.abort()
    setOpen(false)
    setItems([])
    setSearched(false)
    setLoading(false)
    setActiveIndex(-1)
  }

  const handleQueryChange = (raw: string) => {
    window.clearTimeout(debounceRef.current)
    const query = raw.trim()
    if (query.length < minQueryLength || shouldSearch?.(query) === false) {
      close()
      return
    }
    debounceRef.current = window.setTimeout(() => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      setSearched(false)
      setOpen(true)
      search(query, controller.signal)
        .then((results) => {
          if (controller.signal.aborted) {
            return
          }
          setItems(results.slice(0, maxResults))
          setSearched(true)
          setActiveIndex(-1)
          setLoading(false)
        })
        .catch(() => {
          if (controller.signal.aborted) {
            return
          }
          close()
        })
    }, debounceMs)
  }

  const pick = (item: T) => {
    close()
    onPick(item)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      if (!open || items.length === 0) {
        return
      }
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % items.length)
    } else if (event.key === 'ArrowUp') {
      if (!open || items.length === 0) {
        return
      }
      event.preventDefault()
      setActiveIndex((index) => (index <= 0 ? items.length - 1 : index - 1))
    } else if (event.key === 'Enter') {
      if (open && activeIndex >= 0) {
        const item = items[activeIndex]
        if (item !== undefined) {
          event.preventDefault()
          pick(item)
        }
      }
    } else if (event.key === 'Escape') {
      if (open) {
        event.preventDefault()
        close()
      }
    }
  }

  return {
    open,
    items,
    searched,
    loading,
    activeIndex,
    close,
    pick,
    handleQueryChange,
    handleKeyDown,
  }
}
