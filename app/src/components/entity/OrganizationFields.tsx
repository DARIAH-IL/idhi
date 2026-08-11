import { useTranslation } from 'react-i18next'
import { OrganizationOrganizationType } from '@/api/models'
import { TextField } from './TextField'
import { EnumSelectField } from './EnumSelectField'
import { LangStringField } from './LangStringField'
import { StringArrayField } from './StringArrayField'
import { EntityRefField } from './EntityRefField'
import { BooleanField } from './BooleanField'

export function OrganizationFields() {
  const { t } = useTranslation()
  return (
    <>
      <TextField name="name" label={t('entity.form.fields.name')} required />
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
      <TextField
        name="ror"
        label={t('entity.form.fields.ror')}
        validationKind="ror"
        placeholder="https://ror.org/…"
      />
      <EntityRefField
        name="parent_organization"
        label={t('entity.form.fields.parent_organization')}
        entityTypes={['idhi:Organization']}
      />
      <LangStringField
        name="location"
        label={t('entity.form.fields.location')}
      />
      <LangStringField name="address" label={t('entity.form.fields.address')} />
      <StringArrayField
        name="additional_urls"
        label={t('entity.form.fields.additional_urls')}
        validationKind="url"
      />
      <BooleanField
        name="marketplace_sync"
        label={t('entity.form.fields.marketplace_sync')}
      />
    </>
  )
}
