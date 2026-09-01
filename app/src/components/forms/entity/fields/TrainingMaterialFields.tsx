import {
  TrainingMaterialDigitalHumanitiesActivitiesItem,
  TrainingMaterialLicense,
  TrainingMaterialTrainingMaterialType,
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
import { hasLangStringValue, langString } from '#/lib/lang-string.ts'
import { trainingMaterialFormOptions } from '../entity-form-options.ts'

export const TrainingMaterialFields = withForm({
  ...trainingMaterialFormOptions,
  render: function Render({ form }) {
    const duplicateCheck = useDuplicateCheck()
    return (
      <>
        <form.AppField name="doi" validators={valueValidators({ kind: 'doi' })}>
          {(field) => (
            <field.DoiField
              label={
                <EntityFieldLabel entityClass="TrainingMaterial" field="doi" />
              }
              onBlurValue={(value) => duplicateCheck?.check('doi', value)}
              onSelect={(suggestion) => {
                if (!hasLangStringValue(form.getFieldValue('name'))) {
                  form.setFieldValue('name', langString(suggestion.title))
                }
              }}
            />
          )}
        </form.AppField>
        <form.AppField name="name" validators={localizedValueValidators(true)}>
          {(field) => (
            <field.LangStringField
              required
              label={
                <EntityFieldLabel entityClass="TrainingMaterial" field="name" />
              }
              onItemBlur={(value) => duplicateCheck?.check('name.value', value)}
            />
          )}
        </form.AppField>
        <form.AppField
          name="training_material_type"
          validators={enumValidators(TrainingMaterialTrainingMaterialType)}
        >
          {(field) => (
            <field.EnumSelectField
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="training_material_type"
                />
              }
              options={TrainingMaterialTrainingMaterialType}
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
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="description"
                />
              }
              multiline
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
            <field.EnumMultiSelectField
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="digital_humanities_activities"
                />
              }
              options={TrainingMaterialDigitalHumanitiesActivitiesItem}
            />
          )}
        </form.AppField>
        <form.AppField
          name="date_issued"
          validators={valueValidators({ kind: 'date' })}
        >
          {(field) => (
            <field.DatePickerField
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="date_issued"
                />
              }
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
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="homepage"
                />
              }
              type="url"
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
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="contact_email"
                />
              }
              type="email"
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
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="creators"
                />
              }
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
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="publisher"
                />
              }
              entityTypes={['idhi:Organization']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="educational_level"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="educational_level"
                />
              }
            />
          )}
        </form.AppField>
        <form.AppField
          name="target_audiences"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="target_audiences"
                />
              }
            />
          )}
        </form.AppField>
        <form.AppField
          name="prerequisites"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="prerequisites"
                />
              }
              multiline
            />
          )}
        </form.AppField>
        <form.AppField
          name="learning_outcomes"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="learning_outcomes"
                />
              }
              multiline
            />
          )}
        </form.AppField>
        <form.AppField name="in_languages">
          {(field) => (
            <field.LanguagesField
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="in_languages"
                />
              }
            />
          )}
        </form.AppField>
        <form.AppField name="media_type">
          {(field) => (
            <field.TextField
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="media_type"
                />
              }
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
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="license"
                />
              }
              options={TrainingMaterialLicense}
            />
          )}
        </form.AppField>
        <form.AppField
          name="material_url"
          validators={valueValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.TextField
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="material_url"
                />
              }
              type="url"
            />
          )}
        </form.AppField>
        <form.AppField
          name="part_of_training_material"
          validators={entityRefValidators(['idhi:TrainingMaterial'])}
        >
          {(field) => (
            <field.EntityRefField
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="part_of_training_material"
                />
              }
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
              type="url"
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
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
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="related_tools"
                />
              }
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
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="related_services"
                />
              }
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
              label={
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="related_datasets"
                />
              }
              entityTypes={['idhi:Dataset']}
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
                <EntityFieldLabel
                  entityClass="TrainingMaterial"
                  field="same_as"
                />
              }
              placeholder="https://…"
            />
          )}
        </form.AppField>
      </>
    )
  },
})
