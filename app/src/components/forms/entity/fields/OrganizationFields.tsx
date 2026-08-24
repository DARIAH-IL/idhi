import { useTranslation } from 'react-i18next'
import { OrganizationOrganizationType } from '#/api/models'
import { withForm } from '#/components/forms/app-form.ts'
import {
  entityRefValidators,
  enumValidators,
  localizedValueValidators,
  stringArrayValidators,
  valueValidators,
} from '#/components/form-fields/validation.ts'
import { organizationFormOptions } from '../entity-form-options.ts'

export const OrganizationFields = withForm({
  ...organizationFormOptions,
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
          name="organization_type"
          validators={enumValidators(OrganizationOrganizationType)}
        >
          {(field) => (
            <field.EnumSelectField
              label={t('entity.form.fields.organization_type')}
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
              label={t('entity.form.fields.contact_email')}
              type="email"
            />
          )}
        </form.AppField>
        <form.AppField name="ror" validators={valueValidators({ kind: 'ror' })}>
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.ror')}
              placeholder="https://ror.org/…"
            />
          )}
        </form.AppField>
        <form.AppField name="location" validators={localizedValueValidators()}>
          {(field) => (
            <field.LangStringField label={t('entity.form.fields.location')} />
          )}
        </form.AppField>
        <form.AppField name="address" validators={localizedValueValidators()}>
          {(field) => (
            <field.LangStringField label={t('entity.form.fields.address')} />
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
        <form.AppField name="marketplace_sync">
          {(field) => (
            <field.BooleanField
              label={t('entity.form.fields.marketplace_sync')}
            />
          )}
        </form.AppField>

        <form.AppField name="organization_hierarchy" mode="array">
          {(field) => (
            <field.ArraySection
              label={t('entity.form.fields.organization_hierarchy')}
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
                        label={t('entity.form.fields.parent_organization')}
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
                        label={t('entity.form.fields.start_date')}
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
