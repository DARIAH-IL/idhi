import { useEffect, useState } from 'react'

export function useIdle({
  enabled = true,
  timeout,
}: {
  enabled?: boolean
  timeout?: number
} = {}): boolean {
  const [isIdle, setIsIdle] = useState(false)

  useEffect(() => {
    if (!enabled) {
      return
    }

    if (typeof window.requestIdleCallback === 'function') {
      const idleCallback = window.requestIdleCallback(
        () => setIsIdle(true),
        timeout === undefined ? undefined : { timeout },
      )

      return () => window.cancelIdleCallback(idleCallback)
    }

    const fallback = window.setTimeout(() => setIsIdle(true), 0)
    return () => window.clearTimeout(fallback)
  }, [enabled, timeout])

  return enabled && isIdle
}
