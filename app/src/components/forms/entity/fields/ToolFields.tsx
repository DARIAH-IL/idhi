import {
  ToolDigitalHumanitiesActivitiesItem,
  ToolLicense,
  ToolResourceContributionsItemResourceContributionRole,
  ToolToolType,
} from '#/api/models'
import { EntityFieldLabel } from '#/components/entity/EntityFieldLabel.tsx'
import { withForm } from '#/components/forms/app-form.ts'
import { useDuplicateCheck } from '#/components/forms/entity/duplicate-check.tsx'
import { FieldPair } from '#/components/form-fields/FieldPair.tsx'
import {
  entityRefValidators,
  enumValidators,
  localizedValueValidators,
  stringArrayValidators,
  valueValidators,
} from '#/components/form-fields/validation.ts'
import { hasLangStringValue, langString } from '#/lib/lang-string.ts'
import { toolFormOptions } from '../entity-form-options.ts'

export const ToolFields = withForm({
  ...toolFormOptions,
  render: function Render({ form }) {
    const duplicateCheck = useDuplicateCheck()
    return (
      <>
        <form.AppField name="doi" validators={valueValidators({ kind: 'doi' })}>
          {(field) => (
            <field.DoiField
              label={<EntityFieldLabel entityClass="Tool" field="doi" />}
              onBlurValue={(value) => duplicateCheck?.check('doi', value)}
              onSelect={(suggestion) => {
                if (!hasLangStringValue(form.getFieldValue('name'))) {
                  form.setFieldValue('name', langString(suggestion.title))
                }
              }}
            />
          )}
        </form.AppField>
        <form.AppField name="name" validators={localizedValueValidators(true)}>
          {(field) => (
            <field.LangStringField
              required
              label={<EntityFieldLabel entityClass="Tool" field="name" />}
              onItemBlur={(value) => duplicateCheck?.check('name.value', value)}
            />
          )}
        </form.AppField>
        <form.AppField
          name="tool_type"
          validators={enumValidators(ToolToolType)}
        >
          {(field) => (
            <field.EnumSelectField
              label={<EntityFieldLabel entityClass="Tool" field="tool_type" />}
              options={ToolToolType}
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
                <EntityFieldLabel entityClass="Tool" field="description" />
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
              label={<EntityFieldLabel entityClass="Tool" field="homepage" />}
              type="url"
              placeholder="https://…"
            />
          )}
        </form.AppField>
        <form.AppField
          name="documentation_url"
          validators={valueValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.TextField
              label={
                <EntityFieldLabel
                  entityClass="Tool"
                  field="documentation_url"
                />
              }
              type="url"
            />
          )}
        </form.AppField>
        <form.AppField
          name="code_repository"
          validators={valueValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.TextField
              label={
                <EntityFieldLabel entityClass="Tool" field="code_repository" />
              }
              type="url"
            />
          )}
        </form.AppField>
        <form.AppField name="programming_languages">
          {(field) => (
            <field.ProgrammingLanguagesField
              label={
                <EntityFieldLabel
                  entityClass="Tool"
                  field="programming_languages"
                />
              }
            />
          )}
        </form.AppField>
        <form.AppField name="license" validators={enumValidators(ToolLicense)}>
          {(field) => (
            <field.EnumSelectField
              label={<EntityFieldLabel entityClass="Tool" field="license" />}
              options={ToolLicense}
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
                <EntityFieldLabel entityClass="Tool" field="additional_urls" />
              }
              placeholder="https://…"
            />
          )}
        </form.AppField>
        <form.AppField
          name="digital_humanities_activities"
          validators={stringArrayValidators({
            allowedValues: ToolDigitalHumanitiesActivitiesItem,
          })}
        >
          {(field) => (
            <field.EnumMultiSelectField
              label={
                <EntityFieldLabel
                  entityClass="Tool"
                  field="digital_humanities_activities"
                />
              }
              options={ToolDigitalHumanitiesActivitiesItem}
              suggestField="digital_humanities_activities"
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
                <EntityFieldLabel entityClass="Tool" field="contact_email" />
              }
              type="email"
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
              label={<EntityFieldLabel entityClass="Tool" field="same_as" />}
              placeholder="https://…"
            />
          )}
        </form.AppField>

        <form.AppField name="resource_contributions" mode="array">
          {(field) => (
            <field.ArraySection
              label={
                <EntityFieldLabel
                  entityClass="Tool"
                  field="resource_contributions"
                />
              }
              defaultItem={{ contributor: '', resource_contribution_role: '' }}
            >
              {(index) => (
                <>
                  <form.AppField
                    name={`resource_contributions[${index}].contributor`}
                    validators={entityRefValidators(
                      ['idhi:Person', 'idhi:Organization'],
                      { required: true },
                    )}
                  >
                    {(nestedField) => (
                      <nestedField.EntityRefField
                        required
                        label={
                          <EntityFieldLabel
                            entityClass="ResourceContribution"
                            field="contributor"
                          />
                        }
                        entityTypes={['idhi:Person', 'idhi:Organization']}
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`resource_contributions[${index}].resource_contribution_role`}
                    validators={enumValidators(
                      ToolResourceContributionsItemResourceContributionRole,
                      true,
                    )}
                  >
                    {(nestedField) => (
                      <nestedField.EnumSelectField
                        label={
                          <EntityFieldLabel
                            entityClass="ResourceContribution"
                            field="resource_contribution_role"
                          />
                        }
                        options={
                          ToolResourceContributionsItemResourceContributionRole
                        }
                        required
                      />
                    )}
                  </form.AppField>
                  <FieldPair>
                    <form.AppField
                      name={`resource_contributions[${index}].start_date`}
                      validators={valueValidators({ kind: 'date' })}
                    >
                      {(nestedField) => (
                        <nestedField.DatePickerField
                          label={
                            <EntityFieldLabel
                              entityClass="ResourceContribution"
                              field="start_date"
                            />
                          }
                        />
                      )}
                    </form.AppField>
                    <form.AppField
                      name={`resource_contributions[${index}].end_date`}
                      validators={valueValidators({ kind: 'date' })}
                    >
                      {(nestedField) => (
                        <nestedField.DatePickerField
                          label={
                            <EntityFieldLabel
                              entityClass="ResourceContribution"
                              field="end_date"
                            />
                          }
                        />
                      )}
                    </form.AppField>
                  </FieldPair>
                </>
              )}
            </field.ArraySection>
          )}
        </form.AppField>
      </>
    )
  },
})
