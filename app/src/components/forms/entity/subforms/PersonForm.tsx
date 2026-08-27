import type { Entity, Person } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { personDefaults, personFormOptions } from '../entity-form-options'
import { PersonFields } from '../fields/PersonFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold, SpecificSection } from './FormScaffold'

interface Props {
  person?: Person
  isSubmitting?: boolean
  onSubmit: (data: Entity) => void
}

export function PersonForm({ person, ...props }: Props) {
  const form = useAppForm({
    ...personFormOptions,
    defaultValues: person ?? personDefaults,
    onSubmit: ({ value }) => props.onSubmit(cleanValue(value)),
  })
  return (
    <form.AppForm>
      <FormScaffold
        form={form}
        isSubmitting={props.isSubmitting}
        onSubmit={() => void form.handleSubmit()}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Person"
          isEditing={!!person}
        />
        <SpecificSection>
          <PersonFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}
