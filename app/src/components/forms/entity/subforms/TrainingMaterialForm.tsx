import type { Entity, TrainingMaterial } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import {
  trainingMaterialDefaults,
  trainingMaterialFormOptions,
} from '../entity-form-options'
import { TrainingMaterialFields } from '../fields/TrainingMaterialFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold } from './FormScaffold'

interface Props {
  trainingMaterial?: TrainingMaterial & { isDraft?: boolean }
  title: React.ReactNode
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => void
}

export function TrainingMaterialForm({ trainingMaterial, ...props }: Props) {
  const form = useAppForm({
    ...trainingMaterialFormOptions,
    defaultValues: trainingMaterial ?? trainingMaterialDefaults,
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
        canSaveAsDraft={!trainingMaterial || trainingMaterial.isDraft === true}
        onSubmit={(isDraft) => void form.handleSubmit({ isDraft })}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:TrainingMaterial"
        />
        <TrainingMaterialFields form={form} />
      </FormScaffold>
    </form.AppForm>
  )
}
