import { useTranslation } from 'react-i18next'
import {
  ServiceDigitalHumanitiesActivitiesItem,
  ServiceServiceType,
} from '@/api/models'
import { TextField } from './TextField'
import { LangStringField } from './LangStringField'
import { EnumSelectField } from './EnumSelectField'
import { StringArrayField } from './StringArrayField'
import { EntityRefField } from './EntityRefField'

export function ServiceFields() {
  const { t } = useTranslation()
  return (
    <>
      <LangStringField
        name="name"
        label={t('entity.form.fields.name')}
        required
      />
      <EnumSelectField
        name="service_type"
        label={t('entity.form.fields.service_type')}
        options={ServiceServiceType}
      />
      <EntityRefField
        name="provider"
        label={t('entity.form.fields.provider')}
        entityTypes={['idhi:Organization']}
      />
      <TextField
        name="documentation_url"
        label={t('entity.form.fields.documentation_url')}
        type="url"
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
        options={ServiceDigitalHumanitiesActivitiesItem}
      />
      <StringArrayField
        name="additional_urls"
        label={t('entity.form.fields.additional_urls')}
        validationKind="url"
      />
    </>
  )
}
