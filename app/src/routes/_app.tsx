import { useEffect, useRef, useState } from 'react'
import { createFileRoute, Outlet, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useInviteStore } from '@/stores/invite'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LoginDialog } from '@/components/auth/LoginDialog'
import { UserMenu } from '@/components/auth/UserMenu'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  const { t } = useTranslation()
  const [loginOpen, setLoginOpen] = useState(false)
  const [inviteParams, setInviteParams] = useState<{
    challengeId: string
    otp: string
  } | null>(null)
  const user = useAuthStore((s) => s.user)
  const language = useUIStore((s) => s.language)
  const inviteConsumedRef = useRef(false)

  useEffect(() => {
    void i18n.changeLanguage(language)
  }, [language])

  useEffect(() => {
    document.title = t('common.site_name')
  }, [t])

  useEffect(() => {
    if (inviteConsumedRef.current) return
    inviteConsumedRef.current = true
    const { challengeId, otp, clear } = useInviteStore.getState()
    if (challengeId && otp) {
      clear()
      setInviteParams({ challengeId, otp })
      setLoginOpen(true)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex min-h-14 items-center justify-between gap-4 border-b px-6 py-2">
        <Link
          to="/entities"
          aria-label={t('common.home')}
          className="flex items-center gap-3"
        >
          <img src="/logo.png" alt="IDHI" className="h-7 w-auto" />
          <span className="text-sm font-semibold sm:text-base">
            {t('common.site_name')}
          </span>
        </Link>
        {user ? (
          <UserMenu />
        ) : (
          <Button variant="ghost" size="sm" onPress={() => setLoginOpen(true)}>
            {t('common.login')}
          </Button>
        )}
      </header>
      <Separator />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        <p>{t('common.copyright')}</p>
        <p className="mt-1">{t('common.work_in_progress')}</p>
      </footer>
      <LoginDialog
        isOpen={loginOpen}
        onOpenChange={(open) => {
          setLoginOpen(open)
          if (!open) setInviteParams(null)
        }}
        inviteParams={inviteParams}
      />
    </div>
  )
}
