import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import { ArrowUp02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const VISIBILITY_THRESHOLD_VIEWPORT_FRACTION = 4

interface JumpToTopProps {
  scrollRef: RefObject<HTMLElement | null>
  className?: string
}

export function JumpToTop({ scrollRef, className }: JumpToTopProps) {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = scrollRef.current
    if (!element) {
      return
    }

    const updateVisibility = () => {
      setIsVisible(
        element.scrollTop >
          element.clientHeight / VISIBILITY_THRESHOLD_VIEWPORT_FRACTION,
      )
    }

    updateVisibility()
    element.addEventListener('scroll', updateVisibility, { passive: true })
    window.addEventListener('resize', updateVisibility)

    return () => {
      element.removeEventListener('scroll', updateVisibility)
      window.removeEventListener('resize', updateVisibility)
    }
  }, [scrollRef])

  if (!isVisible) {
    return null
  }

  const scrollToTop = () => {
    const element = scrollRef.current
    if (!element) {
      return
    }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    element.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <Button
      aria-label={t('common.jump_to_top')}
      variant="secondary"
      size="icon-lg"
      className={cn(
        'absolute end-6 bottom-6 z-50 size-10 rounded-full shadow-lg',
        className,
      )}
      onPress={scrollToTop}
    >
      <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2} />
    </Button>
  )
}
