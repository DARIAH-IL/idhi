import { useTranslation } from 'react-i18next'
import {
  PublicationAuthorshipsItemAuthorshipRole,
  PublicationPublicationType,
} from '@/api/models'
import { withForm } from '@/components/forms/app-form'
import {
  entityRefArrayValidators,
  entityRefValidators,
  enumValidators,
  localizedValueValidators,
  valueValidators,
} from '@/components/form-fields/validation'
import { publicationFormOptions } from './entity-form-options'

export const PublicationFields = withForm({
  ...publicationFormOptions,
  render: function Render({ form }) {
    const { t } = useTranslation()

    return (
      <>
        <form.AppField name="name" validators={localizedValueValidators(true)}>
          {(field) => (
            <field.LangStringField label={t('entity.form.fields.name')} />
          )}
        </form.AppField>
        <form.AppField
          name="publication_type"
          validators={enumValidators(PublicationPublicationType)}
        >
          {(field) => (
            <field.EnumSelectField
              label={t('entity.form.fields.publication_type')}
              options={PublicationPublicationType}
            />
          )}
        </form.AppField>
        <form.AppField name="doi" validators={valueValidators({ kind: 'doi' })}>
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.doi')}
              placeholder="https://doi.org/…"
            />
          )}
        </form.AppField>
        <form.AppField
          name="date_issued"
          validators={valueValidators({ kind: 'date' })}
        >
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.date_issued')}
              type="date"
            />
          )}
        </form.AppField>
        <form.AppField
          name="publisher"
          validators={entityRefValidators(['idhi:Organization'])}
        >
          {(field) => (
            <field.EntityRefField
              label={t('entity.form.fields.publisher')}
              entityTypes={['idhi:Organization']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="part_of"
          validators={entityRefValidators(['idhi:Publication'], {
            allowExternalUrl: true,
          })}
        >
          {(field) => (
            <field.EntityRefField
              label={t('entity.form.fields.part_of')}
              entityTypes={['idhi:Publication']}
              allowExternalUrl
            />
          )}
        </form.AppField>
        <form.AppField
          name="published_in"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={t('entity.form.fields.published_in')}
            />
          )}
        </form.AppField>
        <form.AppField
          name="presented_at"
          validators={entityRefArrayValidators(['idhi:Event'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.presented_at')}
              entityTypes={['idhi:Event']}
            />
          )}
        </form.AppField>

        <form.AppField name="authorships" mode="array">
          {(field) => (
            <field.ArraySection
              label={t('entity.form.fields.authorships')}
              defaultItem={{ author: '' }}
            >
              {(index) => (
                <>
                  <form.AppField
                    name={`authorships[${index}].author`}
                    validators={entityRefValidators(['idhi:Person'], {
                      required: true,
                    })}
                  >
                    {(nestedField) => (
                      <nestedField.EntityRefField
                        label={t('entity.form.member_ref')}
                        entityTypes={['idhi:Person']}
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`authorships[${index}].author_order`}
                    validators={valueValidators({ kind: 'integer', min: 1 })}
                  >
                    {(nestedField) => (
                      <nestedField.TextField
                        label={t('entity.form.author_order')}
                        type="number"
                        min={1}
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`authorships[${index}].authorship_role`}
                    validators={enumValidators(
                      PublicationAuthorshipsItemAuthorshipRole,
                    )}
                  >
                    {(nestedField) => (
                      <nestedField.EnumSelectField
                        label={t('entity.form.authorship_role')}
                        options={PublicationAuthorshipsItemAuthorshipRole}
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`authorships[${index}].start_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.TextField
                        label={t('entity.form.fields.start_date')}
                        type="date"
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`authorships[${index}].end_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.TextField
                        label={t('entity.form.fields.end_date')}
                        type="date"
                      />
                    )}
                  </form.AppField>
                </>
              )}
            </field.ArraySection>
          )}
        </form.AppField>
      </>
    )
  },
})
