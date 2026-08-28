import {
  EventEventAgentRolesItemEventAgentRole,
  EventEventType,
} from '#/api/models'
import { EntityFieldLabel } from '#/components/entity/EntityFieldLabel.tsx'
import { withForm } from '#/components/forms/app-form.ts'
import {
  entityRefValidators,
  enumValidators,
  localizedValueValidators,
  stringArrayValidators,
  valueValidators,
} from '#/components/form-fields/validation.ts'
import { eventFormOptions } from '../entity-form-options.ts'

export const EventFields = withForm({
  ...eventFormOptions,
  render: function Render({ form }) {
    return (
      <>
        <form.AppField name="name" validators={localizedValueValidators(true)}>
          {(field) => (
            <field.LangStringField
              label={<EntityFieldLabel entityClass="Event" field="name" />}
            />
          )}
        </form.AppField>
        <form.AppField
          name="event_type"
          validators={enumValidators(EventEventType)}
        >
          {(field) => (
            <field.EnumSelectField
              label={
                <EntityFieldLabel entityClass="Event" field="event_type" />
              }
              options={EventEventType}
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
                <EntityFieldLabel entityClass="Event" field="description" />
              }
              multiline
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
                <EntityFieldLabel entityClass="Event" field="start_date" />
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
              label={<EntityFieldLabel entityClass="Event" field="end_date" />}
              type="date"
            />
          )}
        </form.AppField>
        <form.AppField
          name="homepage"
          validators={valueValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.TextField
              label={<EntityFieldLabel entityClass="Event" field="homepage" />}
              type="url"
              placeholder="https://…"
            />
          )}
        </form.AppField>
        <form.AppField name="location" validators={localizedValueValidators()}>
          {(field) => (
            <field.LangStringField
              label={<EntityFieldLabel entityClass="Event" field="location" />}
            />
          )}
        </form.AppField>
        <form.AppField name="address" validators={localizedValueValidators()}>
          {(field) => (
            <field.LangStringField
              label={<EntityFieldLabel entityClass="Event" field="address" />}
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
                <EntityFieldLabel entityClass="Event" field="contact_email" />
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
              label={
                <EntityFieldLabel entityClass="Event" field="additional_urls" />
              }
              placeholder="https://…"
            />
          )}
        </form.AppField>

        <form.AppField name="event_agent_roles" mode="array">
          {(field) => (
            <field.ArraySection
              label={
                <EntityFieldLabel
                  entityClass="Event"
                  field="event_agent_roles"
                />
              }
              defaultItem={{ event_agent: '', event_agent_role: '' }}
            >
              {(index) => (
                <>
                  <form.AppField
                    name={`event_agent_roles[${index}].event_agent`}
                    validators={entityRefValidators(
                      ['idhi:Person', 'idhi:Organization'],
                      { required: true },
                    )}
                  >
                    {(nestedField) => (
                      <nestedField.EntityRefField
                        label={
                          <EntityFieldLabel
                            entityClass="EventAgentRole"
                            field="event_agent"
                          />
                        }
                        entityTypes={['idhi:Person', 'idhi:Organization']}
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`event_agent_roles[${index}].event_agent_role`}
                    validators={enumValidators(
                      EventEventAgentRolesItemEventAgentRole,
                      true,
                    )}
                  >
                    {(nestedField) => (
                      <nestedField.EnumSelectField
                        label={
                          <EntityFieldLabel
                            entityClass="EventAgentRole"
                            field="event_agent_role"
                          />
                        }
                        options={EventEventAgentRolesItemEventAgentRole}
                        required
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`event_agent_roles[${index}].start_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.TextField
                        label={
                          <EntityFieldLabel
                            entityClass="EventAgentRole"
                            field="start_date"
                          />
                        }
                        type="date"
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`event_agent_roles[${index}].end_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.TextField
                        label={
                          <EntityFieldLabel
                            entityClass="EventAgentRole"
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
        <form.AppField
          name="same_as"
          validators={stringArrayValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.StringArrayField
              label={<EntityFieldLabel entityClass="Event" field="same_as" />}
              placeholder="https://…"
            />
          )}
        </form.AppField>
      </>
    )
  },
})
