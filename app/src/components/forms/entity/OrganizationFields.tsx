import { useTranslation } from 'react-i18next'
import { OrganizationOrganizationType } from '@/api/models'
import { TextField } from '@/components/form-fields/TextField'
import { EnumSelectField } from '@/components/form-fields/EnumSelectField'
import { LangStringField } from '@/components/form-fields/LangStringField'
import { StringArrayField } from '@/components/form-fields/StringArrayField'
import { EntityRefField } from './EntityRefField'
import { BooleanField } from '@/components/form-fields/BooleanField'

export function OrganizationFields() {
  const { t } = useTranslation()
  return (
    <>
      <LangStringField
        name="name"
        label={t('entity.form.fields.name')}
        required
      />
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
