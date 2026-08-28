import type { Entity, Service } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { serviceDefaults, serviceFormOptions } from '../entity-form-options'
import { ServiceFields } from '../fields/ServiceFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold, SpecificSection } from './FormScaffold'

interface Props {
  service?: Service & { isDraft?: boolean }
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => void
}

export function ServiceForm({ service, ...props }: Props) {
  const form = useAppForm({
    ...serviceFormOptions,
    defaultValues: service ?? serviceDefaults,
    onSubmitMeta: { isDraft: false },
    onSubmit: ({ value, meta }) =>
      props.onSubmit(cleanValue(value), meta.isDraft),
  })
  return (
    <form.AppForm>
      <FormScaffold
        form={form}
        isSubmitting={props.isSubmitting}
        canSaveAsDraft={!service || service.isDraft === true}
        onSubmit={(isDraft) => void form.handleSubmit({ isDraft })}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Service"
          isEditing={!!service}
        />
        <SpecificSection>
          <ServiceFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}
