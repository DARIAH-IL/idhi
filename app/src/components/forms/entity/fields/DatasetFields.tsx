import {
  DatasetDatasetType,
  DatasetLicense,
  DatasetResourceContributionsItemResourceContributionRole,
} from '#/api/models'
import { EntityFieldLabel } from '#/components/entity/EntityFieldLabel.tsx'
import { withForm } from '#/components/forms/app-form.ts'
import {
  entityRefArrayValidators,
  entityRefValidators,
  enumValidators,
  localizedValueValidators,
  stringArrayValidators,
  valueValidators,
} from '#/components/form-fields/validation.ts'
import { hasLangStringValue, langString } from '#/lib/lang-string.ts'
import { datasetFormOptions } from '../entity-form-options.ts'

export const DatasetFields = withForm({
  ...datasetFormOptions,
  render: function Render({ form }) {
    return (
      <>
        <form.AppField name="doi" validators={valueValidators({ kind: 'doi' })}>
          {(field) => (
            <field.DoiField
              label={<EntityFieldLabel entityClass="Dataset" field="doi" />}
              placeholder="https://doi.org/…"
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
              label={<EntityFieldLabel entityClass="Dataset" field="name" />}
            />
          )}
        </form.AppField>
        <form.AppField
          name="dataset_type"
          validators={enumValidators(DatasetDatasetType)}
        >
          {(field) => (
            <field.EnumSelectField
              label={
                <EntityFieldLabel entityClass="Dataset" field="dataset_type" />
              }
              options={DatasetDatasetType}
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
                <EntityFieldLabel entityClass="Dataset" field="description" />
              }
              multiline
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
                <EntityFieldLabel entityClass="Dataset" field="homepage" />
              }
              type="url"
              placeholder="https://…"
            />
          )}
        </form.AppField>
        <form.AppField
          name="distribution_url"
          validators={valueValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.TextField
              label={
                <EntityFieldLabel
                  entityClass="Dataset"
                  field="distribution_url"
                />
              }
              type="url"
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
                <EntityFieldLabel entityClass="Dataset" field="date_issued" />
              }
            />
          )}
        </form.AppField>
        <form.AppField name="themes" validators={localizedValueValidators()}>
          {(field) => (
            <field.LangStringField
              label={<EntityFieldLabel entityClass="Dataset" field="themes" />}
            />
          )}
        </form.AppField>
        <form.AppField name="media_type">
          {(field) => (
            <field.MediaTypeField
              label={
                <EntityFieldLabel entityClass="Dataset" field="media_type" />
              }
            />
          )}
        </form.AppField>
        <form.AppField name="in_languages">
          {(field) => (
            <field.LanguagesField
              label={
                <EntityFieldLabel entityClass="Dataset" field="in_languages" />
              }
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
                <EntityFieldLabel entityClass="Dataset" field="publisher" />
              }
              entityTypes={['idhi:Organization']}
            />
          )}
        </form.AppField>
        <form.AppField name="extent">
          {(field) => (
            <field.StringArrayField
              label={<EntityFieldLabel entityClass="Dataset" field="extent" />}
            />
          )}
        </form.AppField>
        <form.AppField
          name="byte_size"
          validators={valueValidators({ kind: 'integer', min: 0 })}
        >
          {(field) => (
            <field.TextField
              label={
                <EntityFieldLabel entityClass="Dataset" field="byte_size" />
              }
              type="number"
              min={0}
            />
          )}
        </form.AppField>
        <form.AppField
          name="license"
          validators={enumValidators(DatasetLicense)}
        >
          {(field) => (
            <field.EnumSelectField
              label={<EntityFieldLabel entityClass="Dataset" field="license" />}
              options={DatasetLicense}
            />
          )}
        </form.AppField>
        <form.AppField
          name="derived_from"
          validators={entityRefArrayValidators(['idhi:Dataset'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={
                <EntityFieldLabel entityClass="Dataset" field="derived_from" />
              }
              entityTypes={['idhi:Dataset']}
            />
          )}
        </form.AppField>
        <form.AppField
          name="datasets"
          validators={entityRefArrayValidators(['idhi:Dataset'])}
        >
          {(field) => (
            <field.EntityRefArrayField
              label={
                <EntityFieldLabel entityClass="Dataset" field="datasets" />
              }
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
              label={
                <EntityFieldLabel
                  entityClass="Dataset"
                  field="related_publications"
                />
              }
              entityTypes={['idhi:Publication']}
            />
          )}
        </form.AppField>

        <form.AppField name="resource_contributions" mode="array">
          {(field) => (
            <field.ArraySection
              label={
                <EntityFieldLabel
                  entityClass="Dataset"
                  field="resource_contributions"
                />
              }
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
                        label={
                          <EntityFieldLabel
                            entityClass="ResourceContribution"
                            field="contributor"
                          />
                        }
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
                        label={
                          <EntityFieldLabel
                            entityClass="ResourceContribution"
                            field="resource_contribution_role"
                          />
                        }
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
                      <nestedField.DatePickerField
                        label={
                          <EntityFieldLabel
                            entityClass="ResourceContribution"
                            field="start_date"
                          />
                        }
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name={`resource_contributions[${index}].end_date`}
                    validators={valueValidators({ kind: 'date' })}
                  >
                    {(nestedField) => (
                      <nestedField.DatePickerField
                        label={
                          <EntityFieldLabel
                            entityClass="ResourceContribution"
                            field="end_date"
                          />
                        }
                      />
                    )}
                  </form.AppField>
                </>
              )}
            </field.ArraySection>
          )}
        </form.AppField>
        <form.AppField
          name="same_as"
          validators={stringArrayValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.StringArrayField
              label={<EntityFieldLabel entityClass="Dataset" field="same_as" />}
              placeholder="https://…"
            />
          )}
        </form.AppField>
      </>
    )
  },
})
