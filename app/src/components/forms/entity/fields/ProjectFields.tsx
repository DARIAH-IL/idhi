import { useTranslation } from 'react-i18next'
import {
  ProjectDigitalHumanitiesActivitiesItem,
  ProjectFundingStatus,
  ProjectOrganizationRolesItemOrgProjectRole,
  ProjectProjectParticipationsItemParticipationRole,
} from '#/api/models'
import { withForm } from '#/components/forms/app-form.ts'
import {
  entityRefArrayValidators,
  entityRefValidators,
  enumValidators,
  localizedValueValidators,
  stringArrayValidators,
  valueValidators,
} from '#/components/form-fields/validation.ts'
import { projectFormOptions } from '../entity-form-options.ts'

export const ProjectFields = withForm({
  ...projectFormOptions,
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
          name="start_date"
          validators={valueValidators({ kind: 'date' })}
        >
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.start_date')}
              type="date"
            />
          )}
        </form.AppField>
        <form.AppField
          name="end_date"
          validators={valueValidators({ kind: 'date' })}
        >
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.end_date')}
              type="date"
            />
          )}
        </form.AppField>
        <form.AppField
          name="funding_status"
          validators={enumValidators(ProjectFundingStatus)}
        >
          {(field) => (
            <field.EnumSelectField
              label={t('entity.form.fields.funding_status')}
              options={ProjectFundingStatus}
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
          name="research_disciplines"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={t('entity.form.fields.research_disciplines')}
            />
          )}
        </form.AppField>
        <form.AppField
          name="studied_periods"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={t('entity.form.fields.studied_periods')}
            />
          )}
        </form.AppField>
        <form.AppField
          name="studied_places"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={t('entity.form.fields.studied_places')}
            />
          )}
        </form.AppField>
        <form.AppField
          name="digital_humanities_activities"
          validators={stringArrayValidators({
            allowedValues: ProjectDigitalHumanitiesActivitiesItem,
          })}
        >
          {(field) => (
            <field.StringArrayField
              label={t('entity.form.fields.digital_humanities_activities')}
              placeholder="tadirah:…"
              options={ProjectDigitalHumanitiesActivitiesItem}
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

        <form.AppField
          name="outputs_datasets"
          validators={entityRefArrayValidators(['idhi:Dataset'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.outputs_datasets')}
              entityTypes={['idhi:Dataset']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="outputs_publications"
          validators={entityRefArrayValidators(['idhi:Publication'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.outputs_publications')}
              entityTypes={['idhi:Publication']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="outputs_tools"
          validators={entityRefArrayValidators(['idhi:Tool'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.outputs_tools')}
              entityTypes={['idhi:Tool']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="outputs_training_materials"
          validators={entityRefArrayValidators(['idhi:TrainingMaterial'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.outputs_training_materials')}
              entityTypes={['idhi:TrainingMaterial']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="uses_datasets"
          validators={entityRefArrayValidators(['idhi:Dataset'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.uses_datasets')}
              entityTypes={['idhi:Dataset']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="uses_services"
          validators={entityRefArrayValidators(['idhi:Service'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.uses_services')}
              entityTypes={['idhi:Service']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="uses_tools"
          validators={entityRefArrayValidators(['idhi:Tool'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.uses_tools')}
              entityTypes={['idhi:Tool']}
            />
          )}
        </form.AppField>

        <form.AppField name="project_participations" mode="array">
          {(field) => (
            <field.ArraySection
              label={t('entity.form.fields.project_participations')}
              defaultItem={{ participant: '' }}
            >
              {(index) => (
                <>
                  <form.AppField
                    name={`project_participations[${index}].participant`}
                    validators={entityRefValidators(['idhi:Person'], {
                      required: true,
                    })}
                  >
                    {(nestedField) => (
                      <nestedField.EntityRefField
                        label={t('entity.form.member_ref')}
                        entityTypes={['idhi:Person']}
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`project_participations[${index}].participation_role`}
                    validators={enumValidators(
                      ProjectProjectParticipationsItemParticipationRole,
                    )}
                  >
                    {(nestedField) => (
                      <nestedField.EnumSelectField
                        label={t('entity.form.participation_role')}
                        options={
                          ProjectProjectParticipationsItemParticipationRole
                        }
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`project_participations[${index}].start_date`}
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
                    name={`project_participations[${index}].end_date`}
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

        <form.AppField name="organization_roles" mode="array">
          {(field) => (
            <field.ArraySection
              label={t('entity.form.fields.organization_roles')}
              defaultItem={{ organization: '' }}
            >
              {(index) => (
                <>
                  <form.AppField
                    name={`organization_roles[${index}].organization`}
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
                    name={`organization_roles[${index}].org_project_role`}
                    validators={enumValidators(
                      ProjectOrganizationRolesItemOrgProjectRole,
                    )}
                  >
                    {(nestedField) => (
                      <nestedField.EnumSelectField
                        label={t('entity.form.org_project_role')}
                        options={ProjectOrganizationRolesItemOrgProjectRole}
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`organization_roles[${index}].start_date`}
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
                    name={`organization_roles[${index}].end_date`}
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

        <form.AppField name="funding" mode="array">
          {(field) => (
            <field.ArraySection
              label={t('entity.form.fields.funding')}
              defaultItem={{ funding_organization: '' }}
            >
              {(index) => (
                <>
                  <form.AppField
                    name={`funding[${index}].funding_organization`}
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
                    name={`funding[${index}].funding_amount`}
                    validators={valueValidators({ kind: 'number', min: 0 })}
                  >
                    {(nestedField) => (
                      <nestedField.TextField
                        label={t('entity.form.fields.funding_amount')}
                        type="number"
                        min={0}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name={`funding[${index}].grant_number`}>
                    {(nestedField) => (
                      <nestedField.TextField
                        label={t('entity.form.fields.grant_number')}
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`funding[${index}].grant_name`}
                    validators={localizedValueValidators()}
                  >
                    {(nestedField) => (
                      <nestedField.LangStringField
                        label={t('entity.form.fields.grant_name')}
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`funding[${index}].funding_program`}
                    validators={localizedValueValidators()}
                  >
                    {(nestedField) => (
                      <nestedField.LangStringField
                        label={t('entity.form.fields.funding_program')}
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`funding[${index}].funding_url`}
                    validators={valueValidators({ kind: 'url' })}
                  >
                    {(nestedField) => (
                      <nestedField.TextField
                        label={t('entity.form.fields.funding_url')}
                        type="url"
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`funding[${index}].start_date`}
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
                    name={`funding[${index}].end_date`}
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
