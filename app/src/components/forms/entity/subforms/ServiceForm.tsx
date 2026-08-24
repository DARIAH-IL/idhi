import type { Entity, Service } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { serviceDefaults, serviceFormOptions } from '../entity-form-options'
import { ServiceFields } from '../fields/ServiceFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold, SpecificSection } from './FormScaffold'

interface Props {
  service?: Service
  isSubmitting?: boolean
  onSubmit: (data: Entity) => void
}

export function ServiceForm({ service, ...props }: Props) {
  const form = useAppForm({
    ...serviceFormOptions,
    defaultValues: service ?? serviceDefaults,
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
