import type { Entity, Person } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { personDefaults, personFormOptions } from '../entity-form-options'
import { PersonFields } from '../fields/PersonFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold } from './FormScaffold'

interface Props {
  person?: Person & { isDraft?: boolean }
  title: React.ReactNode
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => void
  onCancel: () => void
}

export function PersonForm({ person, ...props }: Props) {
  const form = useAppForm({
    ...personFormOptions,
    defaultValues: person ?? personDefaults,
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
        canSaveAsDraft={!person || person.isDraft === true}
        onSubmit={(isDraft) => void form.handleSubmit({ isDraft })}
        onCancel={props.onCancel}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Person"
        />
        <PersonFields form={form} />
      </FormScaffold>
    </form.AppForm>
  )
}
