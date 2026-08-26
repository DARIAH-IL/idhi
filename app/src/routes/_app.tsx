import { useEffect, useRef, useState } from 'react'
import {
  createFileRoute,
  Outlet,
  Link,
  useNavigate,
} from '@tanstack/react-router'
import { TooltipTrigger } from 'react-aria-components'
import {
  InformationCircleIcon,
  SparklesIcon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import { useAuthLinkStore } from '@/stores/auth-link'
import type { AuthLinkFlow } from '@/stores/auth-link'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip } from '@/components/ui/tooltip'
import { JumpToTop } from '@/components/JumpToTop'
import { LoginDialog } from '@/components/auth/LoginDialog'
import { UserMenu } from '@/components/auth/UserMenu'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  const { t } = useTranslation()
  const [loginOpen, setLoginOpen] = useState(false)
  const [authLinkParams, setAuthLinkParams] = useState<{
    challengeId: string
    otp: string
    flow: AuthLinkFlow
  } | null>(null)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const language = useUIStore((s) => s.language)
  const authLinkConsumedRef = useRef(false)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    void i18n.changeLanguage(language)
  }, [language])

  useEffect(() => {
    document.title = t('common.site_name')
  }, [t])

  useEffect(() => {
    if (authLinkConsumedRef.current) {
      return
    }
    authLinkConsumedRef.current = true
    const { challengeId, otp, flow, clear } = useAuthLinkStore.getState()
    if (challengeId && otp && flow) {
      clear()
      setAuthLinkParams({ challengeId, otp, flow })
      setLoginOpen(true)
    }
  }, [])

  return (
    <div className="flex h-screen flex-col">
      <header className="flex min-h-14 items-center justify-between gap-4 border-b px-6 py-2">
        <Link
          to="/entities"
          aria-label={t('common.home')}
          className="flex items-center gap-3"
        >
          <img
            src="/logo.png"
            alt={t('common.site_name')}
            className="h-7 w-auto"
          />
          <span className="text-sm font-semibold sm:text-base">
            {t('common.site_name')}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <TooltipTrigger delay={0}>
            <Button
              variant="outline"
              size="icon-lg"
              className="rounded-full"
              aria-label={t('about.title')}
              onPress={() => void navigate({ to: '/about' })}
            >
              <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={1.8} />
            </Button>
            <Tooltip>{t('about.title')}</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <Button
              variant="outline"
              size="icon-lg"
              className="rounded-full"
              aria-label={t('about.ai.title')}
              onPress={() => void navigate({ to: '/about/ai' })}
            >
              <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.8} />
            </Button>
            <Tooltip>{t('about.ai.title')}</Tooltip>
          </TooltipTrigger>
          {user ? (
            <UserMenu />
          ) : (
            <TooltipTrigger delay={0}>
              <Button
                variant="outline"
                size="icon-lg"
                className="rounded-full"
                aria-label={t('common.login')}
                onPress={() => setLoginOpen(true)}
              >
                <HugeiconsIcon icon={UserIcon} strokeWidth={1.8} />
              </Button>
              <Tooltip>{t('common.login')}</Tooltip>
            </TooltipTrigger>
          )}
        </div>
      </header>
      <Separator />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <main ref={mainRef} className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <JumpToTop scrollRef={mainRef} />
      </div>
      <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        <p>{t('common.copyright')}</p>
        <p className="mt-1">{t('common.work_in_progress')}</p>
      </footer>
      <LoginDialog
        isOpen={loginOpen}
        onOpenChange={(open) => {
          setLoginOpen(open)
          if (!open) {
            setAuthLinkParams(null)
          }
        }}
        authLinkParams={authLinkParams}
      />
    </div>
  )
}
