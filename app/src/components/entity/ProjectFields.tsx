import { useTranslation } from 'react-i18next'
import {
  ProjectDigitalHumanitiesActivitiesItem,
  ProjectOrganizationRolesItemOrgProjectRole,
  ProjectProjectParticipationsItemParticipationRole,
} from '@/api/models'
import { TextField } from './TextField'
import { LangStringField } from './LangStringField'
import { StringArrayField } from './StringArrayField'
import { ArraySection } from './ArraySection'
import { EnumSelectField } from './EnumSelectField'
import { EntityRefArrayField, EntityRefField } from './EntityRefField'

export function ProjectFields() {
  const { t } = useTranslation()
  return (
    <>
      <TextField name="name" label={t('entity.form.fields.name')} required />
      <TextField
        name="start_date"
        label={t('entity.form.fields.start_date')}
        type="date"
      />
      <TextField
        name="end_date"
        label={t('entity.form.fields.end_date')}
        type="date"
      />
      <TextField
        name="contact_email"
        label={t('entity.form.fields.contact_email')}
        type="email"
      />
      <LangStringField
        name="research_disciplines"
        label={t('entity.form.fields.research_disciplines')}
      />
      <LangStringField
        name="studied_periods"
        label={t('entity.form.fields.studied_periods')}
      />
      <LangStringField
        name="studied_places"
        label={t('entity.form.fields.studied_places')}
      />
      <StringArrayField
        name="digital_humanities_activities"
        label={t('entity.form.fields.digital_humanities_activities')}
        placeholder="tadirah:…"
        options={ProjectDigitalHumanitiesActivitiesItem}
      />
      <EntityRefArrayField
        name="outputs_datasets"
        label={t('entity.form.fields.outputs_datasets')}
        entityTypes={['idhi:Dataset']}
      />
      <EntityRefArrayField
        name="outputs_publications"
        label={t('entity.form.fields.outputs_publications')}
        entityTypes={['idhi:Publication']}
      />
      <EntityRefArrayField
        name="outputs_tools"
        label={t('entity.form.fields.outputs_tools')}
        entityTypes={['idhi:Tool']}
      />
      <EntityRefArrayField
        name="outputs_training_materials"
        label={t('entity.form.fields.outputs_training_materials')}
        entityTypes={['idhi:TrainingMaterial']}
      />
      <StringArrayField
        name="additional_urls"
        label={t('entity.form.fields.additional_urls')}
        validationKind="url"
      />

      <ArraySection
        name="project_participations"
        label={t('entity.form.fields.project_participations')}
        defaultItem={{ participant: '', project: '' }}
      >
        {(i) => (
          <>
            <EntityRefField
              name={`project_participations[${i}].participant`}
              label={t('entity.form.member_ref')}
              entityTypes={['idhi:Person']}
              required
            />
            <EnumSelectField
              name={`project_participations[${i}].participation_role`}
              label={t('entity.form.participation_role')}
              options={ProjectProjectParticipationsItemParticipationRole}
            />
            <TextField
              name={`project_participations[${i}].start_date`}
              label={t('entity.form.fields.start_date')}
              type="date"
            />
            <TextField
              name={`project_participations[${i}].end_date`}
              label={t('entity.form.fields.end_date')}
              type="date"
            />
          </>
        )}
      </ArraySection>

      <ArraySection
        name="organization_roles"
        label={t('entity.form.fields.organization_roles')}
        defaultItem={{ organization: '', project: '' }}
      >
        {(i) => (
          <>
            <EntityRefField
              name={`organization_roles[${i}].organization`}
              label={t('entity.form.organization_ref')}
              entityTypes={['idhi:Organization']}
              required
            />
            <EnumSelectField
              name={`organization_roles[${i}].org_project_role`}
              label={t('entity.form.org_project_role')}
              options={ProjectOrganizationRolesItemOrgProjectRole}
            />
            <TextField
              name={`organization_roles[${i}].start_date`}
              label={t('entity.form.fields.start_date')}
              type="date"
            />
            <TextField
              name={`organization_roles[${i}].end_date`}
              label={t('entity.form.fields.end_date')}
              type="date"
            />
          </>
        )}
      </ArraySection>

      <ArraySection
        name="funding"
        label={t('entity.form.fields.funding')}
        defaultItem={{ funding_organization: '' }}
      >
        {(i) => (
          <>
            <EntityRefField
              name={`funding[${i}].funding_organization`}
              label={t('entity.form.organization_ref')}
              entityTypes={['idhi:Organization']}
              required
            />
            <TextField
              name={`funding[${i}].funding_amount`}
              label={t('entity.form.fields.funding_amount')}
              type="number"
              validationKind="number"
              min={0}
            />
          </>
        )}
      </ArraySection>
    </>
  )
}
