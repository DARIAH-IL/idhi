import { useEffect } from 'react'
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate, Link 
} from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_app')({
  beforeLoad: ({ location }) => {
    const token = useAuthStore.getState().token
    if (!token) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const language = useUIStore((s) => s.language)

  useEffect(() => {
    void i18n.changeLanguage(language)
  }, [language])

  const handleLogout = () => {
    logout()
    void navigate({ to: '/login', replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-11 items-center justify-between border-b px-4">
        <Link to="/entities" className="text-sm font-semibold">
          IDHI
        </Link>
        <Button variant="ghost" size="sm" onPress={handleLogout}>
          {t('common.logout')}
        </Button>
      </header>
      <Separator />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
