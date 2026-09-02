import { useEffect, useRef, useState } from 'react'
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useTranslation } from 'react-i18next'
import i18n, { isRtlLanguage } from '@/i18n'
import { useUIStore } from '@/stores/ui'
import { Toaster } from '@/components/ui/sonner'
import '../styles.css'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const { queryClient } = Route.useRouteContext()
  const { t } = useTranslation()
  const router = useRouter()
  const language = useUIStore((state) => state.language)
  const isRtl = isRtlLanguage(language)
  const [announcement, setAnnouncement] = useState('')
  const previousPathnameRef = useRef(router.state.location.pathname)
  const hasResolvedOnceRef = useRef(false)

  useEffect(() => {
    void i18n.changeLanguage(language)
    document.documentElement.lang = language
    document.documentElement.dir = isRtlLanguage(language) ? 'rtl' : 'ltr'
  }, [language])

  useEffect(() => {
    document.title = t('common.site_name')
  }, [t])

  useEffect(() => {
    return router.subscribe('onResolved', () => {
      const pathname = router.state.location.pathname
      if (!hasResolvedOnceRef.current) {
        hasResolvedOnceRef.current = true
        previousPathnameRef.current = pathname
        return
      }
      if (pathname === previousPathnameRef.current) {
        return
      }
      previousPathnameRef.current = pathname
      document.getElementById('main-content')?.focus({ preventScroll: true })
      setAnnouncement('')
      requestAnimationFrame(() => {
        setAnnouncement(t('common.page_loaded'))
      })
    })
  }, [router, t])

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <div aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>
      <Toaster richColors position={isRtl ? 'bottom-left' : 'bottom-right'} />
      {import.meta.env.DEV && (
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      )}
    </QueryClientProvider>
  )
}
