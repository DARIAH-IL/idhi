import { useTranslation } from 'react-i18next'
import {
  PublicationAuthorshipsItemAuthorshipRole,
  PublicationPublicationType,
} from '@/api/models'
import { TextField } from '@/components/form-fields/TextField'
import { EnumSelectField } from '@/components/form-fields/EnumSelectField'
import { LangStringField } from '@/components/form-fields/LangStringField'
import { ArraySection } from '@/components/form-fields/ArraySection'
import { EntityRefArrayField, EntityRefField } from './EntityRefField'

export function PublicationFields() {
  const { t } = useTranslation()
  return (
    <>
      <LangStringField
        name="name"
        label={t('entity.form.fields.name')}
        required
      />
      <EnumSelectField
        name="publication_type"
        label={t('entity.form.fields.publication_type')}
        options={PublicationPublicationType}
      />
      <TextField
        name="doi"
        label={t('entity.form.fields.doi')}
        placeholder="https://doi.org/…"
        validationKind="doi"
      />
      <TextField
        name="date_issued"
        label={t('entity.form.fields.date_issued')}
        type="date"
      />
      <EntityRefField
        name="publisher"
        label={t('entity.form.fields.publisher')}
        entityTypes={['idhi:Organization']}
      />
      <EntityRefField
        name="part_of"
        label={t('entity.form.fields.part_of')}
        entityTypes={['idhi:Publication']}
        allowExternalUrl
      />
      <LangStringField
        name="published_in"
        label={t('entity.form.fields.published_in')}
      />
      <EntityRefArrayField
        name="presented_at"
        label={t('entity.form.fields.presented_at')}
        entityTypes={['idhi:Event']}
      />

      <ArraySection
        name="authorships"
        label={t('entity.form.fields.authorships')}
        defaultItem={{ author: '', publication: '' }}
      >
        {(i) => (
          <>
            <EntityRefField
              name={`authorships[${i}].author`}
              label={t('entity.form.member_ref')}
              entityTypes={['idhi:Person']}
              required
            />
            <TextField
              name={`authorships[${i}].author_order`}
              label={t('entity.form.author_order')}
              type="number"
              validationKind="integer"
              min={1}
            />
            <EnumSelectField
              name={`authorships[${i}].authorship_role`}
              label={t('entity.form.authorship_role')}
              options={PublicationAuthorshipsItemAuthorshipRole}
            />
            <TextField
              name={`authorships[${i}].start_date`}
              label={t('entity.form.fields.start_date')}
              type="date"
            />
            <TextField
              name={`authorships[${i}].end_date`}
              label={t('entity.form.fields.end_date')}
              type="date"
            />
          </>
        )}
      </ArraySection>
    </>
  )
}
