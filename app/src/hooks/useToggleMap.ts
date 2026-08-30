import { useState } from 'react'

export function useToggleMap(): [
  Record<string, boolean>,
  (key: string) => void,
] {
  const [state, setState] = useState<Record<string, boolean>>({})

  const toggle = (key: string) => {
    setState((current) => ({ ...current, [key]: !current[key] }))
  }

  return [state, toggle]
}
