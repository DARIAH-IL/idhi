import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_app/about/')({
  component: AboutPage,
})

function AboutPage() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-lg font-semibold">{t('about.title')}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {t('about.placeholder')}
      </p>
    </div>
  )
}
