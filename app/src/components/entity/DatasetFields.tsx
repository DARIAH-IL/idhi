import { useTranslation } from 'react-i18next'
import { DatasetLicense } from '@/api/models'
import { TextField } from './TextField'
import { EnumSelectField } from './EnumSelectField'
import { LangStringField } from './LangStringField'
import { EntityRefArrayField, EntityRefField } from './EntityRefField'

export function DatasetFields() {
  const { t } = useTranslation()
  return (
    <>
      <TextField name="name" label={t('entity.form.fields.name')} required />
      <TextField
        name="date_issued"
        label={t('entity.form.fields.date_issued')}
        type="date"
      />
      <TextField
        name="distribution_url"
        label={t('entity.form.fields.distribution_url')}
        type="url"
      />
      <EntityRefField
        name="publisher"
        label={t('entity.form.fields.publisher')}
        entityTypes={['idhi:Organization']}
      />
      <EnumSelectField
        name="license"
        label={t('entity.form.fields.license')}
        options={DatasetLicense}
      />
      <LangStringField name="themes" label={t('entity.form.fields.themes')} />
      <EntityRefArrayField
        name="datasets"
        label={t('entity.form.fields.datasets')}
        entityTypes={['idhi:Dataset']}
      />
    </>
  )
}
