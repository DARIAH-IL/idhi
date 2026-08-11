import { useTranslation } from 'react-i18next'
import { TextField } from './TextField'
import { LangStringField } from './LangStringField'
import { StringArrayField } from './StringArrayField'
import { ArraySection } from './ArraySection'

export function ProjectFields() {
  const { t } = useTranslation()
  return (
    <>
      <LangStringField name="name" label={t('entity.form.fields.name')} />
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
      />
      <StringArrayField
        name="outputs_datasets"
        label={t('entity.form.fields.outputs_datasets')}
      />
      <StringArrayField
        name="outputs_publications"
        label={t('entity.form.fields.outputs_publications')}
      />
      <StringArrayField
        name="outputs_tools"
        label={t('entity.form.fields.outputs_tools')}
      />
      <StringArrayField
        name="additional_urls"
        label={t('entity.form.fields.additional_urls')}
      />

      <ArraySection
        name="project_participations"
        label={t('entity.form.fields.project_participations')}
        defaultItem={{ person: '', project: '' }}
      >
        {(i) => (
          <>
            <TextField
              name={`project_participations[${i}].person`}
              label={t('entity.form.member_ref')}
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
            <TextField
              name={`organization_roles[${i}].organization`}
              label={t('entity.form.organization_ref')}
            />
            <TextField
              name={`organization_roles[${i}].org_project_role`}
              label={t('entity.form.org_project_role')}
            />
          </>
        )}
      </ArraySection>

      <ArraySection
        name="funding"
        label={t('entity.form.fields.funding')}
        defaultItem={{ funder: '' }}
      >
        {(i) => (
          <>
            <TextField
              name={`funding[${i}].funder`}
              label={t('entity.form.organization_ref')}
            />
            <TextField name={`funding[${i}].grant_id`} label="Grant ID" />
          </>
        )}
      </ArraySection>
    </>
  )
}
