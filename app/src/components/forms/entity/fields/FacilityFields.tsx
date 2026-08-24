import { useTranslation } from 'react-i18next'
import { FacilityFacilityAffiliationsItemFacilityAffiliationRole } from '#/api/models'
import { withForm } from '#/components/forms/app-form.ts'
import {
  entityRefArrayValidators,
  entityRefValidators,
  enumValidators,
  localizedValueValidators,
  stringArrayValidators,
  valueValidators,
} from '#/components/form-fields/validation.ts'
import { facilityFormOptions } from '../entity-form-options.ts'

export const FacilityFields = withForm({
  ...facilityFormOptions,
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
          name="services_offered"
          validators={entityRefArrayValidators(['idhi:Service'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.services_offered')}
              entityTypes={['idhi:Service']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="tools_provided"
          validators={entityRefArrayValidators(['idhi:Tool'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.tools_provided')}
              entityTypes={['idhi:Tool']}
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

        <form.AppField name="facility_affiliations" mode="array">
          {(field) => (
            <field.ArraySection
              label={t('entity.form.fields.facility_affiliations')}
              defaultItem={{
                organization: '',
                facility_affiliation_role: '',
              }}
            >
              {(index) => (
                <>
                  <form.AppField
                    name={`facility_affiliations[${index}].organization`}
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
                    name={`facility_affiliations[${index}].facility_affiliation_role`}
                    validators={enumValidators(
                      FacilityFacilityAffiliationsItemFacilityAffiliationRole,
                      true,
                    )}
                  >
                    {(nestedField) => (
                      <nestedField.EnumSelectField
                        label={t('entity.form.facility_affiliation_role')}
                        options={
                          FacilityFacilityAffiliationsItemFacilityAffiliationRole
                        }
                        required
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`facility_affiliations[${index}].start_date`}
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
                    name={`facility_affiliations[${index}].end_date`}
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
