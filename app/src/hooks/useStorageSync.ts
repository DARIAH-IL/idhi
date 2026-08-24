import { useEffect } from 'react'

interface PersistStore {
  persist: {
    getOptions: () => { name?: string }
    rehydrate: () => void | Promise<void>
  }
}

export function useStorageSync(store: PersistStore, onClear: () => void) {
  useEffect(() => {
    const key = store.persist.getOptions().name
    const handler = (event: StorageEvent) => {
      if (event.key !== key || event.storageArea !== window.localStorage) {
        return
      }
      if (event.newValue === null) {
        onClear()
        return
      }
      void store.persist.rehydrate()
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])
}
