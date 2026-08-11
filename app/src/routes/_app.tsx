import { useEffect, useState } from 'react'
import { createFileRoute, Outlet, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LoginDialog } from '@/components/auth/LoginDialog'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  const { t } = useTranslation()
  const [loginOpen, setLoginOpen] = useState(false)
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const language = useUIStore((s) => s.language)

  useEffect(() => {
    void i18n.changeLanguage(language)
  }, [language])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-11 items-center justify-between border-b px-4">
        <Link to="/entities" aria-label="IDHI home">
          <img src="/logo.png" alt="IDHI" className="h-7 w-auto" />
        </Link>
        {token ? (
          <Button variant="ghost" size="sm" onPress={logout}>
            {t('common.logout')}
          </Button>
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
      <LoginDialog isOpen={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  )
}
