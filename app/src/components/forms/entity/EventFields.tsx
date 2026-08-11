import { useTranslation } from 'react-i18next'
import { EventEventType } from '@/api/models'
import { TextField } from '@/components/form-fields/TextField'
import { EnumSelectField } from '@/components/form-fields/EnumSelectField'
import { LangStringField } from '@/components/form-fields/LangStringField'
import { StringArrayField } from '@/components/form-fields/StringArrayField'

export function EventFields() {
  const { t } = useTranslation()
  return (
    <>
      <LangStringField
        name="name"
        label={t('entity.form.fields.name')}
        required
      />
      <EnumSelectField
        name="event_type"
        label={t('entity.form.fields.event_type')}
        options={EventEventType}
      />
      <TextField
        name="start_date"
        label={t('entity.form.fields.start_date')}
        type="date"
      />
      <TextField
        name="end_date"
        label={t('entity.form.fields.end_date')}
        type="date"
      />
      <TextField
        name="contact_email"
        label={t('entity.form.fields.contact_email')}
        type="email"
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
    </>
  )
}
