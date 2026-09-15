import { useEffect, useRef, useState } from 'react'
import {
  Outlet,
  createRootRouteWithContext,
  retainSearchParams,
  useRouter,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { UiLanguage } from '@/api/models'
import i18n, { isRtlLanguage } from '@/i18n'
import { useUIStore } from '@/stores/ui'
import { Toaster } from '@/components/ui/sonner'
import { useSeoMetadata } from '@/hooks/useSeoMetadata'
import '../styles.css'

interface RouterContext {
  queryClient: QueryClient
}

const rootSearchSchema = z.object({
  lang: z.enum(UiLanguage).optional(),
})

export const Route = createRootRouteWithContext<RouterContext>()({
  validateSearch: rootSearchSchema,
  search: {
    middlewares: [retainSearchParams(['lang'])],
  },
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

  useSeoMetadata()

  useEffect(() => {
    return router.subscribe('onResolved', () => {
      const nextPathname = router.state.location.pathname
      if (!hasResolvedOnceRef.current) {
        hasResolvedOnceRef.current = true
        previousPathnameRef.current = nextPathname
        return
      }
      if (nextPathname === previousPathnameRef.current) {
        return
      }
      previousPathnameRef.current = nextPathname
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
