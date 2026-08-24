import { useTranslation } from 'react-i18next'
import {
  DatasetDatasetType,
  DatasetLicense,
  DatasetResourceContributionsItemResourceContributionRole,
} from '#/api/models'
import { withForm } from '#/components/forms/app-form.ts'
import {
  entityRefArrayValidators,
  entityRefValidators,
  enumValidators,
  localizedValueValidators,
  valueValidators,
} from '#/components/form-fields/validation.ts'
import { datasetFormOptions } from '../entity-form-options.ts'

export const DatasetFields = withForm({
  ...datasetFormOptions,
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
          name="dataset_type"
          validators={enumValidators(DatasetDatasetType)}
        >
          {(field) => (
            <field.EnumSelectField
              label={t('entity.form.fields.dataset_type')}
              options={DatasetDatasetType}
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
          name="distribution_url"
          validators={valueValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.distribution_url')}
              type="url"
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
          name="license"
          validators={enumValidators(DatasetLicense)}
        >
          {(field) => (
            <field.EnumSelectField
              label={t('entity.form.fields.license')}
              options={DatasetLicense}
            />
          )}
        </form.AppField>
        <form.AppField name="themes" validators={localizedValueValidators()}>
          {(field) => (
            <field.LangStringField label={t('entity.form.fields.themes')} />
          )}
        </form.AppField>
        <form.AppField name="extent">
          {(field) => (
            <field.StringArrayField label={t('entity.form.fields.extent')} />
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
        <form.AppField name="media_type">
          {(field) => (
            <field.StringArrayField
              label={t('entity.form.fields.media_type')}
              placeholder="application/json"
            />
          )}
        </form.AppField>
        <form.AppField
          name="byte_size"
          validators={valueValidators({ kind: 'integer', min: 0 })}
        >
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.byte_size')}
              type="number"
              min={0}
            />
          )}
        </form.AppField>
        <form.AppField
          name="datasets"
          validators={entityRefArrayValidators(['idhi:Dataset'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.datasets')}
              entityTypes={['idhi:Dataset']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="derived_from"
          validators={entityRefArrayValidators(['idhi:Dataset'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.derived_from')}
              entityTypes={['idhi:Dataset']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="related_publications"
          validators={entityRefArrayValidators(['idhi:Publication'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={t('entity.form.fields.related_publications')}
              entityTypes={['idhi:Publication']}
            />
          )}
        </form.AppField>

        <form.AppField name="resource_contributions" mode="array">
          {(field) => (
            <field.ArraySection
              label={t('entity.form.fields.resource_contributions')}
              defaultItem={{ contributor: '', resource_contribution_role: '' }}
            >
              {(index) => (
                <>
                  <form.AppField
                    name={`resource_contributions[${index}].contributor`}
                    validators={entityRefValidators(
                      ['idhi:Person', 'idhi:Organization'],
                      { required: true },
                    )}
                  >
                    {(nestedField) => (
                      <nestedField.EntityRefField
                        label={t('entity.form.contributor_ref')}
                        entityTypes={['idhi:Person', 'idhi:Organization']}
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`resource_contributions[${index}].resource_contribution_role`}
                    validators={enumValidators(
                      DatasetResourceContributionsItemResourceContributionRole,
                      true,
                    )}
                  >
                    {(nestedField) => (
                      <nestedField.EnumSelectField
                        label={t('entity.form.resource_contribution_role')}
                        options={
                          DatasetResourceContributionsItemResourceContributionRole
                        }
                        required
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`resource_contributions[${index}].start_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.TextField
                        label={t('entity.form.fields.start_date')}
                        type="date"
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`resource_contributions[${index}].end_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.TextField
                        label={t('entity.form.fields.end_date')}
                        type="date"
                      />
                    )}
                  </form.AppField>
                </>
              )}
            </field.ArraySection>
          )}
        </form.AppField>
      </>
    )
  },
})
