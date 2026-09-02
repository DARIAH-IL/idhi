import type { Entity, Facility } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { useUIStore } from '@/stores/ui'
import { facilityDefaults, facilityFormOptions } from '../entity-form-options'
import { FacilityFields } from '../fields/FacilityFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold } from './FormScaffold'

interface Props {
  facility?: Facility & { isDraft?: boolean }
  title: React.ReactNode
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => Promise<unknown>
  onCancel: () => void
}

export function FacilityForm({ facility, ...props }: Props) {
  const language = useUIStore((s) => s.language)
  const form = useAppForm({
    ...facilityFormOptions,
    defaultValues: facility ?? facilityDefaults(language),
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
        canSaveAsDraft={!facility || facility.isDraft === true}
        onSubmit={(isDraft) => {
          form.handleSubmit({ isDraft }).catch(() => {})
        }}
        onCancel={props.onCancel}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Facility"
        />
        <FacilityFields form={form} />
      </FormScaffold>
    </form.AppForm>
  )
}
