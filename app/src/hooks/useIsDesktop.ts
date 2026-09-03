import { useSyncExternalStore } from 'react'

const DESKTOP_MEDIA_QUERY = '(min-width: 768px)'

function subscribe(callback: () => void) {
  if (!('matchMedia' in window)) {
    return () => {}
  }

  const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)
  mediaQuery.addEventListener('change', callback)
  return () => mediaQuery.removeEventListener('change', callback)
}

function getSnapshot() {
  return 'matchMedia' in window
    ? window.matchMedia(DESKTOP_MEDIA_QUERY).matches
    : false
}

export function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
