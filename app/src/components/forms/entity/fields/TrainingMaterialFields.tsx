import { useTranslation } from 'react-i18next'
import {
  TrainingMaterialDigitalHumanitiesActivitiesItem,
  TrainingMaterialLicense,
  TrainingMaterialTrainingMaterialType,
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
import { trainingMaterialFormOptions } from '../entity-form-options.ts'

export const TrainingMaterialFields = withForm({
  ...trainingMaterialFormOptions,
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
          name="training_material_type"
          validators={enumValidators(TrainingMaterialTrainingMaterialType)}
        >
          {(field) => (
            <field.EnumSelectField
              label={t('entity.form.fields.training_material_type')}
              options={TrainingMaterialTrainingMaterialType}
            />
          )}
        </form.AppField>
        <form.AppField
          name="creators"
          validators={entityRefArrayValidators([
            'idhi:Person',
            'idhi:Organization',
          ])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.creators')}
              entityTypes={['idhi:Person', 'idhi:Organization']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="publisher"
          validators={entityRefValidators(['idhi:Organization'])}
        >
          {(field) => (
            <field.EntityRefField
              label={t('entity.form.fields.publisher')}
              entityTypes={['idhi:Organization']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="learning_outcomes"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={t('entity.form.fields.learning_outcomes')}
              multiline
            />
          )}
        </form.AppField>
        <form.AppField
          name="target_audiences"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={t('entity.form.fields.target_audiences')}
            />
          )}
        </form.AppField>
        <form.AppField
          name="prerequisites"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={t('entity.form.fields.prerequisites')}
              multiline
            />
          )}
        </form.AppField>
        <form.AppField
          name="educational_level"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={t('entity.form.fields.educational_level')}
            />
          )}
        </form.AppField>
        <form.AppField name="in_languages">
          {(field) => (
            <field.StringArrayField
              label={t('entity.form.fields.in_languages')}
              placeholder="en"
            />
          )}
        </form.AppField>
        <form.AppField
          name="material_url"
          validators={valueValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.material_url')}
              type="url"
            />
          )}
        </form.AppField>
        <form.AppField name="media_type">
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.media_type')}
              placeholder="text/html"
            />
          )}
        </form.AppField>
        <form.AppField
          name="license"
          validators={enumValidators(TrainingMaterialLicense)}
        >
          {(field) => (
            <field.EnumSelectField
              label={t('entity.form.fields.license')}
              options={TrainingMaterialLicense}
            />
          )}
        </form.AppField>
        <form.AppField
          name="date_issued"
          validators={valueValidators({ kind: 'date' })}
        >
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.date_issued')}
              type="date"
            />
          )}
        </form.AppField>
        <form.AppField name="doi" validators={valueValidators({ kind: 'doi' })}>
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.doi')}
              placeholder="https://doi.org/…"
            />
          )}
        </form.AppField>
        <form.AppField
          name="digital_humanities_activities"
          validators={stringArrayValidators({
            allowedValues: TrainingMaterialDigitalHumanitiesActivitiesItem,
          })}
        >
          {(field) => (
            <field.StringArrayField
              label={t('entity.form.fields.digital_humanities_activities')}
              placeholder="tadirah:…"
              options={TrainingMaterialDigitalHumanitiesActivitiesItem}
            />
          )}
        </form.AppField>
        <form.AppField
          name="related_tools"
          validators={entityRefArrayValidators(['idhi:Tool'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.related_tools')}
              entityTypes={['idhi:Tool']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="related_services"
          validators={entityRefArrayValidators(['idhi:Service'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.related_services')}
              entityTypes={['idhi:Service']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="related_datasets"
          validators={entityRefArrayValidators(['idhi:Dataset'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.related_datasets')}
              entityTypes={['idhi:Dataset']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="part_of_training_material"
          validators={entityRefValidators(['idhi:TrainingMaterial'])}
        >
          {(field) => (
            <field.EntityRefField
              label={t('entity.form.fields.part_of_training_material')}
              entityTypes={['idhi:TrainingMaterial']}
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
      </>
    )
  },
})
