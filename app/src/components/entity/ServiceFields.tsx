import { useTranslation } from 'react-i18next'
import { ServiceServiceType } from '@/api/models'
import { TextField } from './TextField'
import { EnumSelectField } from './EnumSelectField'
import { LangStringField } from './LangStringField'
import { StringArrayField } from './StringArrayField'

export function ServiceFields() {
  const { t } = useTranslation()
  return (
    <>
      <LangStringField name="name" label={t('entity.form.fields.name')} />
      <EnumSelectField
        name="service_type"
        label={t('entity.form.fields.service_type')}
        options={ServiceServiceType}
      />
      <TextField name="provider" label={t('entity.form.fields.provider')} />
      <TextField
        name="documentation_url"
        label={t('entity.form.fields.documentation_url')}
      />
      <TextField
        name="contact_email"
        label={t('entity.form.fields.contact_email')}
        type="email"
      />
      <StringArrayField
        name="digital_humanities_activities"
        label={t('entity.form.fields.digital_humanities_activities')}
        placeholder="tadirah:…"
      />
      <StringArrayField
        name="additional_urls"
        label={t('entity.form.fields.additional_urls')}
      />
    </>
  )
}
