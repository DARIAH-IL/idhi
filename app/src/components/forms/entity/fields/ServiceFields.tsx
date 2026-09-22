import {
  ServiceDigitalHumanitiesActivitiesItem,
  ServiceServiceType,
} from '#/api/models'
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
import { serviceFormOptions } from '../entity-form-options.ts'

export const ServiceFields = withForm({
  ...serviceFormOptions,
  render: function Render({ form }) {
    const duplicateCheck = useDuplicateCheck()
    return (
      <>
        <form.AppField name="name" validators={localizedValueValidators(true)}>
          {(field) => (
            <field.LangStringField
              required
              label={<EntityFieldLabel entityClass="Service" field="name" />}
              onItemBlur={(value) => duplicateCheck?.check('name.value', value)}
            />
          )}
        </form.AppField>
        <form.AppField
          name="service_type"
          validators={enumValidators(ServiceServiceType)}
        >
          {(field) => (
            <field.EnumSelectField
              label={
                <EntityFieldLabel entityClass="Service" field="service_type" />
              }
              options={ServiceServiceType}
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
                <EntityFieldLabel entityClass="Service" field="description" />
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
                <EntityFieldLabel entityClass="Service" field="homepage" />
              }
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
                  entityClass="Service"
                  field="documentation_url"
                />
              }
              type="url"
            />
          )}
        </form.AppField>
        <form.AppField
          name="digital_humanities_activities"
          validators={stringArrayValidators({
            allowedValues: ServiceDigitalHumanitiesActivitiesItem,
          })}
        >
          {(field) => (
            <field.EnumMultiSelectField
              label={
                <EntityFieldLabel
                  entityClass="Service"
                  field="digital_humanities_activities"
                />
              }
              options={ServiceDigitalHumanitiesActivitiesItem}
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
                <EntityFieldLabel entityClass="Service" field="contact_email" />
              }
              type="email"
            />
          )}
        </form.AppField>
        <form.AppField
          name="provider"
          validators={entityRefValidators(['idhi:Organization'])}
        >
          {(field) => (
            <field.EntityRefField
              label={
                <EntityFieldLabel entityClass="Service" field="provider" />
              }
              entityTypes={['idhi:Organization']}
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
                  entityClass="Service"
                  field="additional_urls"
                />
              }
              placeholder="https://…"
            />
          )}
        </form.AppField>
        <form.AppField
          name="related_tools"
          validators={entityRefArrayValidators(['idhi:Tool'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={
                <EntityFieldLabel entityClass="Service" field="related_tools" />
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
              label={<EntityFieldLabel entityClass="Service" field="same_as" />}
              placeholder="https://…"
            />
          )}
        </form.AppField>
      </>
    )
  },
})
