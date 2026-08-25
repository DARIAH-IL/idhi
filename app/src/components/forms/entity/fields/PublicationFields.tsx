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
  valueValidators,
} from '#/components/form-fields/validation.ts'
import { publicationFormOptions } from '../entity-form-options.ts'

export const PublicationFields = withForm({
  ...publicationFormOptions,
  render: function Render({ form }) {
    return (
      <>
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
        <form.AppField name="doi" validators={valueValidators({ kind: 'doi' })}>
          {(field) => (
            <field.TextField
              label={<EntityFieldLabel entityClass="Publication" field="doi" />}
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
              label={
                <EntityFieldLabel
                  entityClass="Publication"
                  field="date_issued"
                />
              }
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
              label={
                <EntityFieldLabel entityClass="Publication" field="publisher" />
              }
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
              label={
                <EntityFieldLabel entityClass="Publication" field="part_of" />
              }
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
              label={
                <EntityFieldLabel
                  entityClass="Publication"
                  field="published_in"
                />
              }
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
                      <nestedField.TextField
                        label={
                          <EntityFieldLabel
                            entityClass="Authorship"
                            field="start_date"
                          />
                        }
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
                        label={
                          <EntityFieldLabel
                            entityClass="Authorship"
                            field="end_date"
                          />
                        }
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
