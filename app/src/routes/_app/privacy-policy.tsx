import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_app/privacy-policy')({
  component: PrivacyPolicyPage,
})

function PrivacyPolicyPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t('legal.privacy.title')}
      </h1>
      <div className="mt-4 rounded-xl border bg-muted/30 p-6">
        <p className="leading-7 text-muted-foreground">
          {t('legal.privacy.placeholder')}
        </p>
      </div>
    </div>
  )
}
