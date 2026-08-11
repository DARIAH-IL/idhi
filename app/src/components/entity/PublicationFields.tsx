import { useTranslation } from 'react-i18next'
import { PublicationPublicationType } from '@/api/models'
import { TextField } from './TextField'
import { EnumSelectField } from './EnumSelectField'
import { LangStringField } from './LangStringField'
import { StringArrayField } from './StringArrayField'
import { ArraySection } from './ArraySection'

export function PublicationFields() {
  const { t } = useTranslation()
  return (
    <>
      <LangStringField name="name" label={t('entity.form.fields.name')} />
      <EnumSelectField
        name="publication_type"
        label={t('entity.form.fields.publication_type')}
        options={PublicationPublicationType}
      />
      <TextField
        name="doi"
        label={t('entity.form.fields.doi')}
        placeholder="https://doi.org/…"
      />
      <TextField
        name="date_issued"
        label={t('entity.form.fields.date_issued')}
        type="date"
      />
      <TextField name="publisher" label={t('entity.form.fields.publisher')} />
      <TextField name="part_of" label={t('entity.form.fields.part_of')} />
      <LangStringField
        name="published_in"
        label={t('entity.form.fields.published_in')}
      />
      <StringArrayField
        name="presented_at"
        label={t('entity.form.fields.presented_at')}
      />

      <ArraySection
        name="authorships"
        label={t('entity.form.fields.authorships')}
        defaultItem={{ author: '', publication: '' }}
      >
        {(i) => (
          <>
            <TextField
              name={`authorships[${i}].author`}
              label={t('entity.form.member_ref')}
            />
            <TextField
              name={`authorships[${i}].author_order`}
              label={t('entity.form.author_order')}
              type="number"
            />
          </>
        )}
      </ArraySection>
    </>
  )
}
