import type { Dataset, Entity } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { datasetDefaults, datasetFormOptions } from '../entity-form-options'
import { DatasetFields } from '../fields/DatasetFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold, SpecificSection } from './FormScaffold'

interface Props {
  dataset?: Dataset & { isDraft?: boolean }
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => void
}

export function DatasetForm({ dataset, ...props }: Props) {
  const form = useAppForm({
    ...datasetFormOptions,
    defaultValues: dataset ?? datasetDefaults,
    onSubmitMeta: { isDraft: false },
    onSubmit: ({ value, meta }) =>
      props.onSubmit(cleanValue(value), meta.isDraft),
  })
  return (
    <form.AppForm>
      <FormScaffold
        form={form}
        isSubmitting={props.isSubmitting}
        canSaveAsDraft={!dataset || dataset.isDraft === true}
        onSubmit={(isDraft) => void form.handleSubmit({ isDraft })}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Dataset"
          isEditing={!!dataset}
        />
        <SpecificSection>
          <DatasetFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}
