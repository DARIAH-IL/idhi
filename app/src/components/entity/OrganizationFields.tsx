import { useTranslation } from 'react-i18next'
import { OrganizationOrganizationType } from '@/api/models'
import { TextField } from './TextField'
import { EnumSelectField } from './EnumSelectField'
import { LangStringField } from './LangStringField'
import { StringArrayField } from './StringArrayField'

export function OrganizationFields() {
  const { t } = useTranslation()
  return (
    <>
      <LangStringField name="name" label={t('entity.form.fields.name')} />
      <EnumSelectField
        name="organization_type"
        label={t('entity.form.fields.organization_type')}
        options={OrganizationOrganizationType}
      />
      <TextField
        name="contact_email"
        label={t('entity.form.fields.contact_email')}
        type="email"
      />
      <TextField name="ror" label={t('entity.form.fields.ror')} />
      <TextField
        name="parent_organization"
        label={t('entity.form.fields.parent_organization')}
      />
      <LangStringField
        name="location"
        label={t('entity.form.fields.location')}
      />
      <LangStringField name="address" label={t('entity.form.fields.address')} />
      <StringArrayField
        name="additional_urls"
        label={t('entity.form.fields.additional_urls')}
      />
    </>
  )
}
