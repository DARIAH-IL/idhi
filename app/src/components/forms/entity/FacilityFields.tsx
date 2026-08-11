import { useTranslation } from 'react-i18next'
import { TextField } from '@/components/form-fields/TextField'
import { LangStringField } from '@/components/form-fields/LangStringField'
import { StringArrayField } from '@/components/form-fields/StringArrayField'
import { ArraySection } from '@/components/form-fields/ArraySection'
import { EntityRefArrayField, EntityRefField } from './EntityRefField'

export function FacilityFields() {
  const { t } = useTranslation()
  return (
    <>
      <LangStringField
        name="name"
        label={t('entity.form.fields.name')}
        required
      />
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
      <EntityRefArrayField
        name="services_offered"
        label={t('entity.form.fields.services_offered')}
        entityTypes={['idhi:Service']}
      />
      <EntityRefArrayField
        name="tools_provided"
        label={t('entity.form.fields.tools_provided')}
        entityTypes={['idhi:Tool']}
      />
      <StringArrayField
        name="additional_urls"
        label={t('entity.form.fields.additional_urls')}
        validationKind="url"
      />

      <ArraySection
        name="facility_affiliations"
        label={t('entity.form.fields.facility_affiliations')}
        defaultItem={{ organization: '', facility: '' }}
      >
        {(i) => (
          <>
            <EntityRefField
              name={`facility_affiliations[${i}].organization`}
              label={t('entity.form.organization_ref')}
              entityTypes={['idhi:Organization']}
              required
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
