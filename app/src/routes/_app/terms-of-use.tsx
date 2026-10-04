import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { LegalDocument } from '@/components/LegalDocument'
import { termsOfUseSections } from '@/lib/legal'

export const Route = createFileRoute('/_app/terms-of-use')({
  component: TermsOfUsePage,
})

function TermsOfUsePage() {
  const { t } = useTranslation()

  return (
    <LegalDocument
      title={t('legal.terms.title')}
      sections={termsOfUseSections}
    />
  )
}
