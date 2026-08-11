import { useTranslation } from 'react-i18next'
import { ToolLicense } from '@/api/models'
import { TextField } from './TextField'
import { EnumSelectField } from './EnumSelectField'
import { LangStringField } from './LangStringField'
import { StringArrayField } from './StringArrayField'

export function DatasetFields() {
  const { t } = useTranslation()
  return (
    <>
      <LangStringField name="name" label={t('entity.form.fields.name')} />
      <TextField
        name="date_issued"
        label={t('entity.form.fields.date_issued')}
        type="date"
      />
      <TextField
        name="distribution_url"
        label={t('entity.form.fields.distribution_url')}
      />
      <TextField name="publisher" label={t('entity.form.fields.publisher')} />
      <EnumSelectField
        name="license"
        label={t('entity.form.fields.license')}
        options={ToolLicense}
      />
      <LangStringField name="themes" label={t('entity.form.fields.themes')} />
      <StringArrayField
        name="datasets"
        label={t('entity.form.fields.datasets')}
      />
    </>
  )
}
