import { OrganizationOrganizationType } from '#/api/models'
import { EntityFieldLabel } from '#/components/entity/EntityFieldLabel.tsx'
import { withForm } from '#/components/forms/app-form.ts'
import { useDuplicateCheck } from '#/components/forms/entity/duplicate-check.tsx'
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
    const duplicateCheck = useDuplicateCheck()
    return (
      <>
        <form.AppField name="ror" validators={valueValidators({ kind: 'ror' })}>
          {(field) => (
            <field.RorField
              label={
                <EntityFieldLabel entityClass="Organization" field="ror" />
              }
              onBlurValue={(value) => duplicateCheck?.check('ror', value)}
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
        <form.AppField name="name" validators={localizedValueValidators(true)}>
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel entityClass="Organization" field="name" />
              }
              onItemBlur={(value) => duplicateCheck?.check('name.value', value)}
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
          name="description"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel
                  entityClass="Organization"
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
                <EntityFieldLabel entityClass="Organization" field="homepage" />
              }
              type="url"
              placeholder="https://…"
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
        <form.AppField
          name="additional_urls"
          validators={stringArrayValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.StringArrayField
              type="url"
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

        <form.AppField name="organization_structure" mode="array">
          {(field) => (
            <field.ArraySection
              label={
                <EntityFieldLabel
                  entityClass="Organization"
                  field="organization_structure"
                />
              }
              defaultItem={{ parent_organization: '' }}
            >
              {(index) => (
                <>
                  <form.AppField
                    name={`organization_structure[${index}].parent_organization`}
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
                    name={`organization_structure[${index}].start_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.DatePickerField
                        label={
                          <EntityFieldLabel
                            entityClass="OrganizationHierarchy"
                            field="start_date"
                          />
                        }
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`organization_structure[${index}].end_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.DatePickerField
                        label={
                          <EntityFieldLabel
                            entityClass="OrganizationHierarchy"
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
          name="same_as"
          validators={stringArrayValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.StringArrayField
              type="url"
              label={
                <EntityFieldLabel entityClass="Organization" field="same_as" />
              }
              placeholder="https://…"
            />
          )}
        </form.AppField>
      </>
    )
  },
})
