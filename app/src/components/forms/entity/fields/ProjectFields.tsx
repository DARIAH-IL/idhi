import {
  ProjectDigitalHumanitiesActivitiesItem,
  ProjectFundingStatus,
  ProjectOrganizationRolesItemOrgProjectRole,
  ProjectProjectParticipationsItemParticipationRole,
} from '#/api/models'
import { EntityFieldLabel } from '#/components/entity/EntityFieldLabel.tsx'
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
    return (
      <>
        <form.AppField name="name" validators={localizedValueValidators(true)}>
          {(field) => (
            <field.LangStringField
              label={<EntityFieldLabel entityClass="Project" field="name" />}
            />
          )}
        </form.AppField>
        <form.AppField
          name="start_date"
          validators={valueValidators({ kind: 'date' })}
        >
          {(field) => (
            <field.TextField
              label={
                <EntityFieldLabel entityClass="Project" field="start_date" />
              }
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
              label={
                <EntityFieldLabel entityClass="Project" field="end_date" />
              }
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
              label={
                <EntityFieldLabel
                  entityClass="Project"
                  field="funding_status"
                />
              }
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
              label={
                <EntityFieldLabel entityClass="Project" field="contact_email" />
              }
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
              label={
                <EntityFieldLabel
                  entityClass="Project"
                  field="research_disciplines"
                />
              }
            />
          )}
        </form.AppField>
        <form.AppField
          name="studied_periods"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel
                  entityClass="Project"
                  field="studied_periods"
                />
              }
            />
          )}
        </form.AppField>
        <form.AppField
          name="studied_places"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel
                  entityClass="Project"
                  field="studied_places"
                />
              }
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
              label={
                <EntityFieldLabel
                  entityClass="Project"
                  field="digital_humanities_activities"
                />
              }
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
              label={
                <EntityFieldLabel
                  entityClass="Project"
                  field="additional_urls"
                />
              }
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
              label={
                <EntityFieldLabel
                  entityClass="Project"
                  field="outputs_datasets"
                />
              }
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
              label={
                <EntityFieldLabel
                  entityClass="Project"
                  field="outputs_publications"
                />
              }
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
              label={
                <EntityFieldLabel entityClass="Project" field="outputs_tools" />
              }
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
              label={
                <EntityFieldLabel
                  entityClass="Project"
                  field="outputs_training_materials"
                />
              }
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
              label={
                <EntityFieldLabel entityClass="Project" field="uses_datasets" />
              }
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
              label={
                <EntityFieldLabel entityClass="Project" field="uses_services" />
              }
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
              label={
                <EntityFieldLabel entityClass="Project" field="uses_tools" />
              }
              entityTypes={['idhi:Tool']}
            />
          )}
        </form.AppField>

        <form.AppField name="project_participations" mode="array">
          {(field) => (
            <field.ArraySection
              label={
                <EntityFieldLabel
                  entityClass="Project"
                  field="project_participations"
                />
              }
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
                        label={
                          <EntityFieldLabel
                            entityClass="ProjectParticipation"
                            field="participant"
                          />
                        }
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
                        label={
                          <EntityFieldLabel
                            entityClass="ProjectParticipation"
                            field="participation_role"
                          />
                        }
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
                        label={
                          <EntityFieldLabel
                            entityClass="ProjectParticipation"
                            field="start_date"
                          />
                        }
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
                        label={
                          <EntityFieldLabel
                            entityClass="ProjectParticipation"
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

        <form.AppField name="organization_roles" mode="array">
          {(field) => (
            <field.ArraySection
              label={
                <EntityFieldLabel
                  entityClass="Project"
                  field="organization_roles"
                />
              }
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
                        label={
                          <EntityFieldLabel
                            entityClass="OrganizationProjectRole"
                            field="organization"
                          />
                        }
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
                        label={
                          <EntityFieldLabel
                            entityClass="OrganizationProjectRole"
                            field="org_project_role"
                          />
                        }
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
                        label={
                          <EntityFieldLabel
                            entityClass="OrganizationProjectRole"
                            field="start_date"
                          />
                        }
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
                        label={
                          <EntityFieldLabel
                            entityClass="OrganizationProjectRole"
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

        <form.AppField name="funding" mode="array">
          {(field) => (
            <field.ArraySection
              label={<EntityFieldLabel entityClass="Project" field="funding" />}
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
                        label={
                          <EntityFieldLabel
                            entityClass="Funding"
                            field="funding_organization"
                          />
                        }
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
                        label={
                          <EntityFieldLabel
                            entityClass="Funding"
                            field="funding_amount"
                          />
                        }
                        type="number"
                        min={0}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name={`funding[${index}].grant_number`}>
                    {(nestedField) => (
                      <nestedField.TextField
                        label={
                          <EntityFieldLabel
                            entityClass="Funding"
                            field="grant_number"
                          />
                        }
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`funding[${index}].grant_name`}
                    validators={localizedValueValidators()}
                  >
                    {(nestedField) => (
                      <nestedField.LangStringField
                        label={
                          <EntityFieldLabel
                            entityClass="Funding"
                            field="grant_name"
                          />
                        }
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`funding[${index}].funding_program`}
                    validators={localizedValueValidators()}
                  >
                    {(nestedField) => (
                      <nestedField.LangStringField
                        label={
                          <EntityFieldLabel
                            entityClass="Funding"
                            field="funding_program"
                          />
                        }
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`funding[${index}].funding_url`}
                    validators={valueValidators({ kind: 'url' })}
                  >
                    {(nestedField) => (
                      <nestedField.TextField
                        label={
                          <EntityFieldLabel
                            entityClass="Funding"
                            field="funding_url"
                          />
                        }
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
                        label={
                          <EntityFieldLabel
                            entityClass="Funding"
                            field="start_date"
                          />
                        }
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
                        label={
                          <EntityFieldLabel
                            entityClass="Funding"
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
