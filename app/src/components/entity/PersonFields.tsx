import { useTranslation } from 'react-i18next'
import { PersonAffiliationsItemAffiliationRole } from '@/api/models'
import { TextField } from './TextField'
import { EnumSelectField } from './EnumSelectField'
import { StringArrayField } from './StringArrayField'
import { ArraySection } from './ArraySection'

export function PersonFields() {
  const { t } = useTranslation()

  return (
    <>
      <TextField name="given_name" label={t('entity.form.fields.given_name')} />
      <TextField
        name="family_name"
        label={t('entity.form.fields.family_name')}
      />
      <TextField
        name="orcid"
        label={t('entity.form.fields.orcid')}
        placeholder="https://orcid.org/0000-0000-0000-0000"
      />
      <StringArrayField
        name="emails"
        label={t('entity.form.fields.emails')}
        placeholder="email@example.com"
      />

      <ArraySection
        name="affiliations"
        label={t('entity.form.fields.affiliations')}
        defaultItem={{ organization: '', affiliation_role: '' }}
      >
        {(i) => (
          <>
            <TextField
              name={`affiliations[${i}].organization`}
              label={t('entity.form.organization_ref')}
            />
            <EnumSelectField
              name={`affiliations[${i}].affiliation_role`}
              label={t('entity.form.affiliation_role')}
              options={PersonAffiliationsItemAffiliationRole}
            />
            <TextField
              name={`affiliations[${i}].start_date`}
              label={t('entity.form.fields.start_date')}
              type="date"
            />
            <TextField
              name={`affiliations[${i}].end_date`}
              label={t('entity.form.fields.end_date')}
              type="date"
            />
          </>
        )}
      </ArraySection>

      <ArraySection
        name="authorships"
        label={t('entity.form.fields.authorships')}
        defaultItem={{ author: '', publication: '' }}
      >
        {(i) => (
          <>
            <TextField
              name={`authorships[${i}].publication`}
              label={t('entity.form.publication_ref')}
            />
            <TextField
              name={`authorships[${i}].author_order`}
              label={t('entity.form.author_order')}
              type="number"
            />
            <TextField
              name={`authorships[${i}].start_date`}
              label={t('entity.form.fields.start_date')}
              type="date"
            />
          </>
        )}
      </ArraySection>

      <ArraySection
        name="project_participations"
        label={t('entity.form.fields.project_participations')}
        defaultItem={{ project: '', person: '' }}
      >
        {(i) => (
          <>
            <TextField
              name={`project_participations[${i}].project`}
              label={t('entity.form.project_ref')}
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
    </>
  )
}
