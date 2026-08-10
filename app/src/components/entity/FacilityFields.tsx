import { useTranslation } from 'react-i18next'
import { TextField } from './TextField'
import { LangStringField } from './LangStringField'
import { StringArrayField } from './StringArrayField'
import { ArraySection } from './ArraySection'

export function FacilityFields() {
  const { t } = useTranslation()
  return (
    <>
      <LangStringField name="name" label={t('entity.form.fields.name')} />
      <TextField
        name="contact_email"
        label={t('entity.form.fields.contact_email')}
        type="email"
      />
      <LangStringField
        name="location"
        label={t('entity.form.fields.location')}
      />
      <LangStringField name="address" label={t('entity.form.fields.address')} />
      <StringArrayField
        name="services_offered"
        label={t('entity.form.fields.services_offered')}
      />
      <StringArrayField
        name="tools_provided"
        label={t('entity.form.fields.tools_provided')}
      />
      <StringArrayField
        name="additional_urls"
        label={t('entity.form.fields.additional_urls')}
      />

      <ArraySection
        name="facility_affiliations"
        label={t('entity.form.fields.facility_affiliations')}
        defaultItem={{ organization: '', facility: '' }}
      >
        {(i) => (
          <>
            <TextField
              name={`facility_affiliations[${i}].organization`}
              label={t('entity.form.organization_ref')}
            />
            <TextField
              name={`facility_affiliations[${i}].start_date`}
              label={t('entity.form.fields.start_date')}
              type="date"
            />
            <TextField
              name={`facility_affiliations[${i}].end_date`}
              label={t('entity.form.fields.end_date')}
              type="date"
            />
          </>
        )}
      </ArraySection>
    </>
  )
}
