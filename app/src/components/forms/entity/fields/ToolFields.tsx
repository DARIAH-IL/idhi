import { useTranslation } from 'react-i18next'
import {
  ToolDigitalHumanitiesActivitiesItem,
  ToolLicense,
  ToolResourceContributionsItemResourceContributionRole,
  ToolToolType,
} from '#/api/models'
import { withForm } from '#/components/forms/app-form.ts'
import {
  entityRefValidators,
  enumValidators,
  localizedValueValidators,
  stringArrayValidators,
  valueValidators,
} from '#/components/form-fields/validation.ts'
import { toolFormOptions } from '../entity-form-options.ts'

export const ToolFields = withForm({
  ...toolFormOptions,
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
          name="tool_type"
          validators={enumValidators(ToolToolType)}
        >
          {(field) => (
            <field.EnumSelectField
              label={t('entity.form.fields.tool_type')}
              options={ToolToolType}
            />
          )}
        </form.AppField>
        <form.AppField name="license" validators={enumValidators(ToolLicense)}>
          {(field) => (
            <field.EnumSelectField
              label={t('entity.form.fields.license')}
              options={ToolLicense}
            />
          )}
        </form.AppField>
        <form.AppField
          name="code_repository"
          validators={valueValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.code_repository')}
              type="url"
            />
          )}
        </form.AppField>
        <form.AppField
          name="documentation_url"
          validators={valueValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.documentation_url')}
              type="url"
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
        <form.AppField name="programming_language">
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.programming_language')}
            />
          )}
        </form.AppField>
        <form.AppField
          name="contact_email"
          validators={valueValidators({ kind: 'email' })}
        >
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.contact_email')}
              type="email"
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
            <field.StringArrayField
              label={t('entity.form.fields.digital_humanities_activities')}
              placeholder="tadirah:…"
              options={ToolDigitalHumanitiesActivitiesItem}
            />
          )}
        </form.AppField>
        <form.AppField
          name="additional_urls"
          validators={stringArrayValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.StringArrayField
              label={t('entity.form.fields.additional_urls')}
              placeholder="https://…"
            />
          )}
        </form.AppField>

        <form.AppField name="resource_contributions" mode="array">
          {(field) => (
            <field.ArraySection
              label={t('entity.form.fields.resource_contributions')}
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
                        label={t('entity.form.contributor_ref')}
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
                        label={t('entity.form.resource_contribution_role')}
                        options={
                          ToolResourceContributionsItemResourceContributionRole
                        }
                        required
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`resource_contributions[${index}].start_date`}
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
                    name={`resource_contributions[${index}].end_date`}
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
