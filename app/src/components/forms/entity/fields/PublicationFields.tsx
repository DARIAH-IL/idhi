import {
  PublicationAuthorshipsItemAuthorshipRole,
  PublicationPublicationType,
} from '#/api/models'
import { EntityFieldLabel } from '#/components/entity/EntityFieldLabel.tsx'
import { withForm } from '#/components/forms/app-form.ts'
import {
  entityRefArrayValidators,
  entityRefValidators,
  enumValidators,
  localizedValueValidators,
  stringArrayValidators,
  valueValidators,
} from '#/components/form-fields/validation.ts'
import { hasLangStringValue, langString } from '#/lib/lang-string.ts'
import { publicationFormOptions } from '../entity-form-options.ts'

export const PublicationFields = withForm({
  ...publicationFormOptions,
  render: function Render({ form }) {
    return (
      <>
        <form.AppField name="doi" validators={valueValidators({ kind: 'doi' })}>
          {(field) => (
            <field.DoiField
              label={<EntityFieldLabel entityClass="Publication" field="doi" />}
              onSelect={(suggestion) => {
                if (!hasLangStringValue(form.getFieldValue('name'))) {
                  form.setFieldValue('name', langString(suggestion.title))
                }
                if (
                  suggestion.publishedDate &&
                  !form.getFieldValue('date_issued')
                ) {
                  form.setFieldValue('date_issued', suggestion.publishedDate)
                }
                if (
                  suggestion.containerTitle &&
                  !hasLangStringValue(form.getFieldValue('published_in'))
                ) {
                  form.setFieldValue(
                    'published_in',
                    langString(suggestion.containerTitle),
                  )
                }
              }}
            />
          )}
        </form.AppField>
        <form.AppField name="name" validators={localizedValueValidators(true)}>
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel entityClass="Publication" field="name" />
              }
            />
          )}
        </form.AppField>
        <form.AppField
          name="publication_type"
          validators={enumValidators(PublicationPublicationType)}
        >
          {(field) => (
            <field.EnumSelectField
              label={
                <EntityFieldLabel
                  entityClass="Publication"
                  field="publication_type"
                />
              }
              options={PublicationPublicationType}
            />
          )}
        </form.AppField>
        <form.AppField
          name="description"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel
                  entityClass="Publication"
                  field="description"
                />
              }
              multiline
            />
          )}
        </form.AppField>
        <form.AppField
          name="homepage"
          validators={valueValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.TextField
              label={
                <EntityFieldLabel entityClass="Publication" field="homepage" />
              }
              type="url"
              placeholder="https://…"
            />
          )}
        </form.AppField>
        <form.AppField
          name="date_issued"
          validators={valueValidators({ kind: 'date' })}
        >
          {(field) => (
            <field.DatePickerField
              label={
                <EntityFieldLabel
                  entityClass="Publication"
                  field="date_issued"
                />
              }
            />
          )}
        </form.AppField>
        <form.AppField
          name="publisher"
          validators={entityRefValidators(['idhi:Organization'])}
        >
          {(field) => (
            <field.EntityRefField
              label={
                <EntityFieldLabel entityClass="Publication" field="publisher" />
              }
              entityTypes={['idhi:Organization']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="published_in"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel
                  entityClass="Publication"
                  field="published_in"
                />
              }
            />
          )}
        </form.AppField>

        <form.AppField name="authorships" mode="array">
          {(field) => (
            <field.ArraySection
              label={
                <EntityFieldLabel
                  entityClass="Publication"
                  field="authorships"
                />
              }
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
                        label={
                          <EntityFieldLabel
                            entityClass="Authorship"
                            field="author"
                          />
                        }
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
                        label={
                          <EntityFieldLabel
                            entityClass="Authorship"
                            field="author_order"
                          />
                        }
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
                        label={
                          <EntityFieldLabel
                            entityClass="Authorship"
                            field="authorship_role"
                          />
                        }
                        options={PublicationAuthorshipsItemAuthorshipRole}
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`authorships[${index}].start_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.DatePickerField
                        label={
                          <EntityFieldLabel
                            entityClass="Authorship"
                            field="start_date"
                          />
                        }
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`authorships[${index}].end_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.DatePickerField
                        label={
                          <EntityFieldLabel
                            entityClass="Authorship"
                            field="end_date"
                          />
                        }
                      />
                    )}
                  </form.AppField>
                </>
              )}
            </field.ArraySection>
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
              label={
                <EntityFieldLabel entityClass="Publication" field="part_of" />
              }
              entityTypes={['idhi:Publication']}
              allowExternalUrl
            />
          )}
        </form.AppField>
        <form.AppField
          name="presented_at"
          validators={entityRefArrayValidators(['idhi:Event'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={
                <EntityFieldLabel
                  entityClass="Publication"
                  field="presented_at"
                />
              }
              entityTypes={['idhi:Event']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="same_as"
          validators={stringArrayValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.StringArrayField
              type="url"
              label={
                <EntityFieldLabel entityClass="Publication" field="same_as" />
              }
              placeholder="https://…"
            />
          )}
        </form.AppField>
      </>
    )
  },
})
