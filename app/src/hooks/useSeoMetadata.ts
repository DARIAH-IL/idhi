import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { Entity } from '@/api/models'
import { getEntityDescription, getEntityDisplayName } from '@/lib/entity'
import { updateSeoMetadata } from '@/lib/seo'
import { useUIStore } from '@/stores/ui'

function isEntity(value: unknown): value is Entity {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'type' in value &&
    typeof value.type === 'string'
  )
}

export function useSeoMetadata() {
  const { t } = useTranslation()
  const { pathname } = useRouterState({
    select: (state) => state.location,
  })
  const leafLoaderData = useRouterState({
    select: (state) => state.matches.at(-1)?.loaderData,
  })
  const language = useUIStore((state) => state.language)

  useEffect(() => {
    const isEntityDetail = /^\/entities\/[^/]+\/?$/.test(pathname)
    const entity =
      isEntityDetail && isEntity(leafLoaderData) ? leafLoaderData : null
    const pageTitle = entity
      ? getEntityDisplayName(entity)
      : pathname.startsWith('/privacy-policy')
        ? t('legal.privacy.title')
        : pathname.startsWith('/terms-of-use')
          ? t('legal.terms.title')
          : pathname.startsWith('/about/ai')
            ? t('about.ai.title')
            : pathname.startsWith('/about')
              ? t('about.title')
              : pathname.startsWith('/entities')
                ? t('board.title')
                : t('common.site_name')
    const description = entity
      ? (getEntityDescription(entity) ??
        t('seo.entity_description', {
          name: getEntityDisplayName(entity),
        }))
      : pathname.startsWith('/privacy-policy')
        ? t('legal.privacy.placeholder')
        : pathname.startsWith('/terms-of-use')
          ? t('legal.terms.placeholder')
          : pathname.startsWith('/about/ai')
            ? t('about.ai.intro')
            : pathname.startsWith('/about')
              ? t('seo.about_description')
              : t('seo.description')

    updateSeoMetadata({
      title:
        pageTitle === t('common.site_name')
          ? pageTitle
          : `${pageTitle} | ${t('common.site_name')}`,
      pageTitle,
      siteName: t('common.site_name'),
      description,
      language,
      pathname,
      entity,
    })
  }, [language, leafLoaderData, pathname, t])
}
