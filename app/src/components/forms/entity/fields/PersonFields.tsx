import { PersonAffiliationsItemAffiliationRole } from '#/api/models'
import { EntityFieldLabel } from '#/components/entity/EntityFieldLabel.tsx'
import { withForm } from '#/components/forms/app-form.ts'
import {
  entityRefValidators,
  enumValidators,
  localizedValueValidators,
  stringArrayValidators,
  valueValidators,
} from '#/components/form-fields/validation.ts'
import { hasLangStringValue, langString } from '#/lib/lang-string.ts'
import { personFormOptions } from '../entity-form-options.ts'

export const PersonFields = withForm({
  ...personFormOptions,
  render: function Render({ form }) {
    return (
      <>
        <form.AppField
          name="given_name"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel entityClass="Person" field="given_name" />
              }
            />
          )}
        </form.AppField>
        <form.AppField
          name="family_name"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel entityClass="Person" field="family_name" />
              }
            />
          )}
        </form.AppField>
        <form.AppField
          name="orcid"
          validators={valueValidators({ kind: 'orcid' })}
        >
          {(field) => (
            <field.OrcidField
              label={<EntityFieldLabel entityClass="Person" field="orcid" />}
              placeholder="https://orcid.org/0000-0000-0000-0000"
              onSelect={(suggestion) => {
                if (
                  suggestion.givenNames &&
                  !hasLangStringValue(form.getFieldValue('given_name'))
                ) {
                  form.setFieldValue(
                    'given_name',
                    langString(suggestion.givenNames),
                  )
                }
                if (
                  suggestion.familyName &&
                  !hasLangStringValue(form.getFieldValue('family_name'))
                ) {
                  form.setFieldValue(
                    'family_name',
                    langString(suggestion.familyName),
                  )
                }
                const emails = form.getFieldValue('emails')
                if (
                  suggestion.email &&
                  !emails?.some((email) => email.trim())
                ) {
                  form.setFieldValue('emails', [suggestion.email])
                }
              }}
            />
          )}
        </form.AppField>
        <form.AppField
          name="emails"
          validators={stringArrayValidators({ kind: 'email' })}
        >
          {(field) => (
            <field.StringArrayField
              label={<EntityFieldLabel entityClass="Person" field="emails" />}
              placeholder="email@example.com"
            />
          )}
        </form.AppField>
        <form.AppField
          name="homepage"
          validators={valueValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.TextField
              label={<EntityFieldLabel entityClass="Person" field="homepage" />}
              type="url"
              placeholder="https://…"
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
                <EntityFieldLabel entityClass="Person" field="description" />
              }
              multiline
            />
          )}
        </form.AppField>

        <form.AppField name="affiliations" mode="array">
          {(field) => (
            <field.ArraySection
              label={
                <EntityFieldLabel entityClass="Person" field="affiliations" />
              }
              defaultItem={{ organization: '' }}
            >
              {(index) => (
                <>
                  <form.AppField
                    name={`affiliations[${index}].organization`}
                    validators={entityRefValidators(['idhi:Organization'], {
                      required: true,
                    })}
                  >
                    {(nestedField) => (
                      <nestedField.EntityRefField
                        label={
                          <EntityFieldLabel
                            entityClass="Affiliation"
                            field="organization"
                          />
                        }
                        entityTypes={['idhi:Organization']}
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`affiliations[${index}].affiliation_role`}
                    validators={enumValidators(
                      PersonAffiliationsItemAffiliationRole,
                    )}
                  >
                    {(nestedField) => (
                      <nestedField.EnumSelectField
                        label={
                          <EntityFieldLabel
                            entityClass="Affiliation"
                            field="affiliation_role"
                          />
                        }
                        options={PersonAffiliationsItemAffiliationRole}
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`affiliations[${index}].start_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.TextField
                        label={
                          <EntityFieldLabel
                            entityClass="Affiliation"
                            field="start_date"
                          />
                        }
                        type="date"
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`affiliations[${index}].end_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.TextField
                        label={
                          <EntityFieldLabel
                            entityClass="Affiliation"
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
        <form.AppField
          name="same_as"
          validators={stringArrayValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.StringArrayField
              label={<EntityFieldLabel entityClass="Person" field="same_as" />}
              placeholder="https://…"
            />
          )}
        </form.AppField>
      </>
    )
  },
})
