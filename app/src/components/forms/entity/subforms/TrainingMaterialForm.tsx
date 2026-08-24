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
  trainingMaterial?: TrainingMaterial
  isSubmitting?: boolean
  onSubmit: (data: Entity) => void
}

export function TrainingMaterialForm({ trainingMaterial, ...props }: Props) {
  const form = useAppForm({
    ...trainingMaterialFormOptions,
    defaultValues: trainingMaterial ?? trainingMaterialDefaults,
    onSubmit: ({ value }) => props.onSubmit(cleanValue(value)),
  })
  return (
    <form.AppForm>
      <FormScaffold
        isSubmitting={props.isSubmitting}
        onSubmit={() => void form.handleSubmit()}
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
