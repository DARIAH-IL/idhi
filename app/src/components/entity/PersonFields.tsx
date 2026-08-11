import { useTranslation } from 'react-i18next'
import {
  PersonAffiliationsItemAffiliationRole,
  PersonAuthorshipsItemAuthorshipRole,
  PersonProjectParticipationsItemParticipationRole,
} from '@/api/models'
import { TextField } from './TextField'
import { LangStringField } from './LangStringField'
import { EnumSelectField } from './EnumSelectField'
import { StringArrayField } from './StringArrayField'
import { ArraySection } from './ArraySection'
import { EntityRefField } from './EntityRefField'

export function PersonFields() {
  const { t } = useTranslation()

  return (
    <>
      <LangStringField
        name="given_name"
        label={t('entity.form.fields.given_name')}
      />
      <LangStringField
        name="family_name"
        label={t('entity.form.fields.family_name')}
      />
      <TextField
        name="orcid"
        label={t('entity.form.fields.orcid')}
        placeholder="https://orcid.org/0000-0000-0000-0000"
        validationKind="orcid"
      />
      <StringArrayField
        name="emails"
        label={t('entity.form.fields.emails')}
        placeholder="email@example.com"
        validationKind="email"
      />

      <ArraySection
        name="affiliations"
        label={t('entity.form.fields.affiliations')}
        defaultItem={{ organization: '', affiliation_role: '' }}
      >
        {(i) => (
          <>
            <EntityRefField
              name={`affiliations[${i}].organization`}
              label={t('entity.form.organization_ref')}
              entityTypes={['idhi:Organization']}
              required
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
            <EntityRefField
              name={`authorships[${i}].publication`}
              label={t('entity.form.publication_ref')}
              entityTypes={['idhi:Publication']}
              required
            />
            <TextField
              name={`authorships[${i}].author_order`}
              label={t('entity.form.author_order')}
              type="number"
              validationKind="integer"
              min={1}
            />
            <EnumSelectField
              name={`authorships[${i}].authorship_role`}
              label={t('entity.form.authorship_role')}
              options={PersonAuthorshipsItemAuthorshipRole}
            />
            <TextField
              name={`authorships[${i}].start_date`}
              label={t('entity.form.fields.start_date')}
              type="date"
            />
            <TextField
              name={`authorships[${i}].end_date`}
              label={t('entity.form.fields.end_date')}
              type="date"
            />
          </>
        )}
      </ArraySection>

      <ArraySection
        name="project_participations"
        label={t('entity.form.fields.project_participations')}
        defaultItem={{ project: '', participant: '' }}
      >
        {(i) => (
          <>
            <EntityRefField
              name={`project_participations[${i}].project`}
              label={t('entity.form.project_ref')}
              entityTypes={['idhi:Project']}
              required
            />
            <EnumSelectField
              name={`project_participations[${i}].participation_role`}
              label={t('entity.form.participation_role')}
              options={PersonProjectParticipationsItemParticipationRole}
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
