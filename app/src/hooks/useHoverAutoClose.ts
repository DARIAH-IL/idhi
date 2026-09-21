import { useCallback, useEffect, useState } from 'react'

export function useHoverAutoClose(timeoutMs: number) {
  const [isOpen, setIsOpenState] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const setIsOpen = useCallback((open: boolean) => {
    setIsOpenState(open)
    if (!open) {
      setIsHovered(false)
    }
  }, [])

  const toggle = useCallback(() => setIsOpen(!isOpen), [isOpen, setIsOpen])

  useEffect(() => {
    if (!isOpen || isHovered) {
      return
    }
    const timeout = setTimeout(() => setIsOpen(false), timeoutMs)
    return () => clearTimeout(timeout)
  }, [isOpen, isHovered, timeoutMs, setIsOpen])

  return {
    isOpen,
    setIsOpen,
    toggle,
    setIsHovered,
    hoverProps: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
  }
}
