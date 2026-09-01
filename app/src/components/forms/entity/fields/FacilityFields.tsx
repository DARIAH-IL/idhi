import { FacilityFacilityAffiliationsItemFacilityAffiliationRole } from '#/api/models'
import { EntityFieldLabel } from '#/components/entity/EntityFieldLabel.tsx'
import { withForm } from '#/components/forms/app-form.ts'
import { useDuplicateCheck } from '#/components/forms/entity/duplicate-check.tsx'
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
    const duplicateCheck = useDuplicateCheck()
    return (
      <>
        <form.AppField name="name" validators={localizedValueValidators(true)}>
          {(field) => (
            <field.LangStringField
              required
              label={<EntityFieldLabel entityClass="Facility" field="name" />}
              onItemBlur={(value) => duplicateCheck?.check('name.value', value)}
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
                <EntityFieldLabel entityClass="Facility" field="description" />
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
                <EntityFieldLabel entityClass="Facility" field="homepage" />
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
                <EntityFieldLabel entityClass="Facility" field="location" />
              }
            />
          )}
        </form.AppField>
        <form.AppField name="address" validators={localizedValueValidators()}>
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel entityClass="Facility" field="address" />
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
                  entityClass="Facility"
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
                  entityClass="Facility"
                  field="additional_urls"
                />
              }
              placeholder="https://…"
            />
          )}
        </form.AppField>

        <form.AppField name="facility_affiliations" mode="array">
          {(field) => (
            <field.ArraySection
              label={
                <EntityFieldLabel
                  entityClass="Facility"
                  field="facility_affiliations"
                />
              }
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
                        required
                        label={
                          <EntityFieldLabel
                            entityClass="FacilityAffiliation"
                            field="organization"
                          />
                        }
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
                        label={
                          <EntityFieldLabel
                            entityClass="FacilityAffiliation"
                            field="facility_affiliation_role"
                          />
                        }
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
                      <nestedField.DatePickerField
                        label={
                          <EntityFieldLabel
                            entityClass="FacilityAffiliation"
                            field="start_date"
                          />
                        }
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`facility_affiliations[${index}].end_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.DatePickerField
                        label={
                          <EntityFieldLabel
                            entityClass="FacilityAffiliation"
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
          name="services_offered"
          validators={entityRefArrayValidators(['idhi:Service'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={
                <EntityFieldLabel
                  entityClass="Facility"
                  field="services_offered"
                />
              }
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
              label={
                <EntityFieldLabel
                  entityClass="Facility"
                  field="tools_provided"
                />
              }
              entityTypes={['idhi:Tool']}
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
                <EntityFieldLabel entityClass="Facility" field="same_as" />
              }
              placeholder="https://…"
            />
          )}
        </form.AppField>
      </>
    )
  },
})
