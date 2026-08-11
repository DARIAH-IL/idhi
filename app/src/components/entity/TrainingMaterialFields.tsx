import { useTranslation } from 'react-i18next'
import {
  TrainingMaterialLicense,
  TrainingMaterialTrainingMaterialType,
  TrainingMaterialDigitalHumanitiesActivitiesItem,
  TrainingMaterialInLanguagesItem,
} from '@/api/models'
import { EnumSelectField } from './EnumSelectField'
import { LangStringField } from './LangStringField'
import { StringArrayField } from './StringArrayField'
import { TextField } from './TextField'
import { EntityRefArrayField, EntityRefField } from './EntityRefField'

export function TrainingMaterialFields() {
  const { t } = useTranslation()

  return (
    <>
      <LangStringField
        name="name"
        label={t('entity.form.fields.name')}
        required
      />
      <EnumSelectField
        name="training_material_type"
        label={t('entity.form.fields.training_material_type')}
        options={TrainingMaterialTrainingMaterialType}
      />
      <EntityRefArrayField
        name="creators"
        label={t('entity.form.fields.creators')}
        entityTypes={['idhi:Person', 'idhi:Organization']}
      />
      <EntityRefField
        name="publisher"
        label={t('entity.form.fields.publisher')}
        entityTypes={['idhi:Organization']}
      />
      <LangStringField
        name="learning_outcomes"
        label={t('entity.form.fields.learning_outcomes')}
        multiline
      />
      <LangStringField
        name="target_audiences"
        label={t('entity.form.fields.target_audiences')}
      />
      <LangStringField
        name="prerequisites"
        label={t('entity.form.fields.prerequisites')}
        multiline
      />
      <LangStringField
        name="educational_level"
        label={t('entity.form.fields.educational_level')}
      />
      <StringArrayField
        name="in_languages"
        label={t('entity.form.fields.in_languages')}
        placeholder="en"
        options={TrainingMaterialInLanguagesItem}
      />
      <TextField
        name="material_url"
        label={t('entity.form.fields.material_url')}
        type="url"
      />
      <TextField
        name="media_type"
        label={t('entity.form.fields.media_type')}
        placeholder="text/html"
      />
      <EnumSelectField
        name="license"
        label={t('entity.form.fields.license')}
        options={TrainingMaterialLicense}
      />
      <TextField
        name="date_issued"
        label={t('entity.form.fields.date_issued')}
        type="date"
      />
      <StringArrayField
        name="digital_humanities_activities"
        label={t('entity.form.fields.digital_humanities_activities')}
        placeholder="tadirah:…"
        options={TrainingMaterialDigitalHumanitiesActivitiesItem}
      />
      <EntityRefArrayField
        name="related_tools"
        label={t('entity.form.fields.related_tools')}
        entityTypes={['idhi:Tool']}
      />
      <EntityRefArrayField
        name="related_services"
        label={t('entity.form.fields.related_services')}
        entityTypes={['idhi:Service']}
      />
      <EntityRefArrayField
        name="related_datasets"
        label={t('entity.form.fields.related_datasets')}
        entityTypes={['idhi:Dataset']}
      />
      <EntityRefField
        name="part_of_training_material"
        label={t('entity.form.fields.part_of_training_material')}
        entityTypes={['idhi:TrainingMaterial']}
      />
      <StringArrayField
        name="additional_urls"
        label={t('entity.form.fields.additional_urls')}
        placeholder="https://…"
        validationKind="url"
      />
      <TextField
        name="contact_email"
        label={t('entity.form.fields.contact_email')}
        type="email"
      />
    </>
  )
}
