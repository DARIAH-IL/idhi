import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_app/terms-of-use')({
  component: TermsOfUsePage,
})

function TermsOfUsePage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t('legal.terms.title')}
      </h1>
      <div className="mt-4 rounded-xl border bg-muted/30 p-6">
        <p className="leading-7 text-muted-foreground">
          {t('legal.terms.placeholder')}
        </p>
      </div>
    </div>
  )
}
