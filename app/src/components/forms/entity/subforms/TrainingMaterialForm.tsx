import type { Entity, TrainingMaterial } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import {
  trainingMaterialDefaults,
  trainingMaterialFormOptions,
} from '../entity-form-options'
import { TrainingMaterialFields } from '../fields/TrainingMaterialFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold, SpecificSection } from './FormScaffold'

interface Props {
  trainingMaterial?: TrainingMaterial & { isDraft?: boolean }
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
        isSubmitting={props.isSubmitting}
        canSaveAsDraft={!trainingMaterial || trainingMaterial.isDraft === true}
        onSubmit={(isDraft) => void form.handleSubmit({ isDraft })}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:TrainingMaterial"
          isEditing={!!trainingMaterial}
        />
        <SpecificSection>
          <TrainingMaterialFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}
