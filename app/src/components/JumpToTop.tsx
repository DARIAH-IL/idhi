import { useEffect, useState } from 'react'
import { ArrowUp02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

export function JumpToTop() {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > window.innerHeight)
    }

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    window.addEventListener('resize', updateVisibility)

    return () => {
      window.removeEventListener('scroll', updateVisibility)
      window.removeEventListener('resize', updateVisibility)
    }
  }, [])

  if (!isVisible) return null

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <Button
      aria-label={t('common.jump_to_top')}
      variant="secondary"
      size="icon-lg"
      className="fixed end-6 bottom-6 z-50 size-10 rounded-full shadow-lg"
      onPress={scrollToTop}
    >
      <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2} />
    </Button>
  )
}
