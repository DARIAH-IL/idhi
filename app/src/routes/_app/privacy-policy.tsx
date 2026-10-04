import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { LegalDocument } from '@/components/LegalDocument'
import { privacyPolicySections } from '@/lib/legal'

export const Route = createFileRoute('/_app/privacy-policy')({
  component: PrivacyPolicyPage,
})

function PrivacyPolicyPage() {
  const { t } = useTranslation()

  return (
    <LegalDocument
      title={t('legal.privacy.title')}
      sections={privacyPolicySections}
    />
  )
}
