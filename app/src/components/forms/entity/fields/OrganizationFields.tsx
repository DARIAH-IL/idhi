import { OrganizationOrganizationType } from '#/api/models'
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
import { rorLocation } from './identifiers/RorField.tsx'
import { organizationFormOptions } from '../entity-form-options.ts'

export const OrganizationFields = withForm({
  ...organizationFormOptions,
  render: function Render({ form }) {
    return (
      <>
        <form.AppField name="name" validators={localizedValueValidators(true)}>
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel entityClass="Organization" field="name" />
              }
            />
          )}
        </form.AppField>
        <form.AppField
          name="organization_type"
          validators={enumValidators(OrganizationOrganizationType)}
        >
          {(field) => (
            <field.EnumSelectField
              label={
                <EntityFieldLabel
                  entityClass="Organization"
                  field="organization_type"
                />
              }
              options={OrganizationOrganizationType}
            />
          )}
        </form.AppField>
        <form.AppField
          name="contact_email"
          validators={valueValidators({ kind: 'email' })}
        >
          {(field) => (
            <field.TextField
              label={
                <EntityFieldLabel
                  entityClass="Organization"
                  field="contact_email"
                />
              }
              type="email"
            />
          )}
        </form.AppField>
        <form.AppField name="ror" validators={valueValidators({ kind: 'ror' })}>
          {(field) => (
            <field.RorField
              label={
                <EntityFieldLabel entityClass="Organization" field="ror" />
              }
              placeholder="https://ror.org/…"
              onSelect={(suggestion) => {
                if (!hasLangStringValue(form.getFieldValue('name'))) {
                  form.setFieldValue('name', langString(suggestion.name))
                }
                const locationText = rorLocation(suggestion)
                if (
                  locationText &&
                  !hasLangStringValue(form.getFieldValue('location'))
                ) {
                  form.setFieldValue('location', langString(locationText))
                }
              }}
            />
          )}
        </form.AppField>
        <form.AppField name="location" validators={localizedValueValidators()}>
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel entityClass="Organization" field="location" />
              }
            />
          )}
        </form.AppField>
        <form.AppField name="address" validators={localizedValueValidators()}>
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel entityClass="Organization" field="address" />
              }
            />
          )}
        </form.AppField>
        <form.AppField
          name="additional_urls"
          validators={stringArrayValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.StringArrayField
              label={
                <EntityFieldLabel
                  entityClass="Organization"
                  field="additional_urls"
                />
              }
              placeholder="https://…"
            />
          )}
        </form.AppField>
        <form.AppField name="marketplace_sync">
          {(field) => (
            <field.BooleanField
              label={
                <EntityFieldLabel
                  entityClass="Organization"
                  field="marketplace_sync"
                />
              }
            />
          )}
        </form.AppField>

        <form.AppField name="organization_hierarchy" mode="array">
          {(field) => (
            <field.ArraySection
              label={
                <EntityFieldLabel
                  entityClass="Organization"
                  field="organization_hierarchy"
                />
              }
              defaultItem={{ parent_organization: '' }}
            >
              {(index) => (
                <>
                  <form.AppField
                    name={`organization_hierarchy[${index}].parent_organization`}
                    validators={entityRefValidators(['idhi:Organization'], {
                      required: true,
                    })}
                  >
                    {(nestedField) => (
                      <nestedField.EntityRefField
                        label={
                          <EntityFieldLabel
                            entityClass="OrganizationHierarchy"
                            field="parent_organization"
                          />
                        }
                        entityTypes={['idhi:Organization']}
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`organization_hierarchy[${index}].start_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.TextField
                        label={
                          <EntityFieldLabel
                            entityClass="OrganizationHierarchy"
                            field="start_date"
                          />
                        }
                        type="date"
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`organization_hierarchy[${index}].end_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.TextField
                        label={
                          <EntityFieldLabel
                            entityClass="OrganizationHierarchy"
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
