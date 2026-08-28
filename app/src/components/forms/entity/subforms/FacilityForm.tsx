import type { Entity, Facility } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { facilityDefaults, facilityFormOptions } from '../entity-form-options'
import { FacilityFields } from '../fields/FacilityFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold, SpecificSection } from './FormScaffold'

interface Props {
  facility?: Facility & { isDraft?: boolean }
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => void
}

export function FacilityForm({ facility, ...props }: Props) {
  const form = useAppForm({
    ...facilityFormOptions,
    defaultValues: facility ?? facilityDefaults,
    onSubmitMeta: { isDraft: false },
    onSubmit: ({ value, meta }) =>
      props.onSubmit(cleanValue(value), meta.isDraft),
  })
  return (
    <form.AppForm>
      <FormScaffold
        form={form}
        isSubmitting={props.isSubmitting}
        canSaveAsDraft={!facility || facility.isDraft === true}
        onSubmit={(isDraft) => void form.handleSubmit({ isDraft })}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Facility"
          isEditing={!!facility}
        />
        <SpecificSection>
          <FacilityFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}
