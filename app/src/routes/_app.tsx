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
  ChatBotIcon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import i18n, { isRtlLanguage } from '@/i18n'
import { useAuthLinkStore } from '@/stores/auth-link'
import type { AuthLinkFlow } from '@/stores/auth-link'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip } from '@/components/ui/tooltip'
import { JumpToTop } from '@/components/JumpToTop'
import { UiLanguagePicker } from '#/components/UiLanguagePicker.tsx'
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
    document.documentElement.lang = language
    document.documentElement.dir = isRtlLanguage(language) ? 'rtl' : 'ltr'
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-foreground"
      >
        {t('common.skip_to_content')}
      </a>
      <header className="flex min-h-14 items-center justify-between gap-4 border-b px-6 py-2">
        <Link to="/entities" className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-7 w-auto" />
          <span className="text-sm font-semibold sm:text-base">
            {t('common.site_name')}
          </span>
        </Link>
        <nav
          aria-label={t('common.primary_navigation')}
          className="flex items-center gap-2"
        >
          <UiLanguagePicker />
          <TooltipTrigger delay={0}>
            <Button
              variant="outline"
              size="icon-xl"
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
              size="icon-xl"
              className="rounded-full"
              aria-label={t('about.ai.title')}
              onPress={() => void navigate({ to: '/about/ai' })}
            >
              <HugeiconsIcon icon={ChatBotIcon} strokeWidth={1.8} />
            </Button>
            <Tooltip>{t('about.ai.title')}</Tooltip>
          </TooltipTrigger>
          {user ? (
            <UserMenu />
          ) : (
            <TooltipTrigger delay={0}>
              <Button
                variant="outline"
                size="icon-xl"
                className="rounded-full"
                aria-label={t('common.login')}
                onPress={() => setLoginOpen(true)}
              >
                <HugeiconsIcon icon={UserIcon} strokeWidth={1.8} />
              </Button>
              <Tooltip>{t('common.login')}</Tooltip>
            </TooltipTrigger>
          )}
        </nav>
      </header>
      <Separator />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <main
          id="main-content"
          tabIndex={-1}
          ref={mainRef}
          className="flex-1 overflow-y-auto p-6 outline-none"
        >
          <Outlet />
        </main>
        <JumpToTop scrollRef={mainRef} />
      </div>
      <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        <p>{t('common.copyright', { year: new Date().getFullYear() })}</p>
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
