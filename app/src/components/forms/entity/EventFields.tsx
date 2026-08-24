import { useTranslation } from 'react-i18next'
import {
  EventEventAgentRolesItemEventAgentRole,
  EventEventType,
} from '@/api/models'
import { withForm } from '@/components/forms/app-form'
import {
  entityRefValidators,
  enumValidators,
  localizedValueValidators,
  stringArrayValidators,
  valueValidators,
} from '@/components/form-fields/validation'
import { eventFormOptions } from './entity-form-options'

export const EventFields = withForm({
  ...eventFormOptions,
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
          name="event_type"
          validators={enumValidators(EventEventType)}
        >
          {(field) => (
            <field.EnumSelectField
              label={t('entity.form.fields.event_type')}
              options={EventEventType}
            />
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

        <form.AppField name="event_agent_roles" mode="array">
          {(field) => (
            <field.ArraySection
              label={t('entity.form.fields.event_agent_roles')}
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
                        label={t('entity.form.event_agent_ref')}
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
                        label={t('entity.form.event_agent_role')}
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
                        label={t('entity.form.fields.start_date')}
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
