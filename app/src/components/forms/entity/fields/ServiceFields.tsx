import { useTranslation } from 'react-i18next'
import {
  ServiceDigitalHumanitiesActivitiesItem,
  ServiceServiceType,
} from '#/api/models'
import { withForm } from '#/components/forms/app-form.ts'
import {
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
    const { t } = useTranslation()

    return (
      <>
        <form.AppField name="name" validators={localizedValueValidators(true)}>
          {(field) => (
            <field.LangStringField label={t('entity.form.fields.name')} />
          )}
        </form.AppField>
        <form.AppField
          name="service_type"
          validators={enumValidators(ServiceServiceType)}
        >
          {(field) => (
            <field.EnumSelectField
              label={t('entity.form.fields.service_type')}
              options={ServiceServiceType}
            />
          )}
        </form.AppField>
        <form.AppField
          name="provider"
          validators={entityRefValidators(['idhi:Organization'])}
        >
          {(field) => (
            <field.EntityRefField
              label={t('entity.form.fields.provider')}
              entityTypes={['idhi:Organization']}
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
            allowedValues: ServiceDigitalHumanitiesActivitiesItem,
          })}
        >
          {(field) => (
            <field.StringArrayField
              label={t('entity.form.fields.digital_humanities_activities')}
              placeholder="tadirah:…"
              options={ServiceDigitalHumanitiesActivitiesItem}
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
      </>
    )
  },
})
