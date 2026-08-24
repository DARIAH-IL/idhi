import { useTranslation } from 'react-i18next'
import { PersonAffiliationsItemAffiliationRole } from '@/api/models'
import { withForm } from '@/components/forms/app-form'
import {
  entityRefValidators,
  enumValidators,
  localizedValueValidators,
  stringArrayValidators,
  valueValidators,
} from '@/components/form-fields/validation'
import { personFormOptions } from './entity-form-options'

export const PersonFields = withForm({
  ...personFormOptions,
  render: function Render({ form }) {
    const { t } = useTranslation()

    return (
      <>
        <form.AppField
          name="given_name"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField label={t('entity.form.fields.given_name')} />
          )}
        </form.AppField>
        <form.AppField
          name="family_name"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={t('entity.form.fields.family_name')}
            />
          )}
        </form.AppField>
        <form.AppField
          name="orcid"
          validators={valueValidators({ kind: 'orcid' })}
        >
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.orcid')}
              placeholder="https://orcid.org/0000-0000-0000-0000"
            />
          )}
        </form.AppField>
        <form.AppField
          name="emails"
          validators={stringArrayValidators({ kind: 'email' })}
        >
          {(field) => (
            <field.StringArrayField
              label={t('entity.form.fields.emails')}
              placeholder="email@example.com"
            />
          )}
        </form.AppField>

        <form.AppField name="affiliations" mode="array">
          {(field) => (
            <field.ArraySection
              label={t('entity.form.fields.affiliations')}
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
                        label={t('entity.form.organization_ref')}
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
                        label={t('entity.form.affiliation_role')}
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
                        label={t('entity.form.fields.start_date')}
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
