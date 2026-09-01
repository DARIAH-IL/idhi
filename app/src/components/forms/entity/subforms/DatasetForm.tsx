import type { Dataset, Entity } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { useUIStore } from '@/stores/ui'
import { datasetDefaults, datasetFormOptions } from '../entity-form-options'
import { DatasetFields } from '../fields/DatasetFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold } from './FormScaffold'

interface Props {
  dataset?: Dataset & { isDraft?: boolean }
  title: React.ReactNode
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => void
  onCancel: () => void
}

export function DatasetForm({ dataset, ...props }: Props) {
  const language = useUIStore((s) => s.language)
  const form = useAppForm({
    ...datasetFormOptions,
    defaultValues: dataset ?? datasetDefaults(language),
    onSubmitMeta: { isDraft: false },
    onSubmit: ({ value, meta }) =>
      props.onSubmit(cleanValue(value), meta.isDraft),
  })
  return (
    <form.AppForm>
      <FormScaffold
        form={form}
        title={props.title}
        isSubmitting={props.isSubmitting}
        canSaveAsDraft={!dataset || dataset.isDraft === true}
        onSubmit={(isDraft) => void form.handleSubmit({ isDraft })}
        onCancel={props.onCancel}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Dataset"
        />
        <DatasetFields form={form} />
      </FormScaffold>
    </form.AppForm>
  )
}
