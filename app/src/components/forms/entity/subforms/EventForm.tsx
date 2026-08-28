import type { Entity, Event } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { eventDefaults, eventFormOptions } from '../entity-form-options'
import { EventFields } from '../fields/EventFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold, SpecificSection } from './FormScaffold'

interface Props {
  event?: Event & { isDraft?: boolean }
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => void
}

export function EventForm({ event, ...props }: Props) {
  const form = useAppForm({
    ...eventFormOptions,
    defaultValues: event ?? eventDefaults,
    onSubmitMeta: { isDraft: false },
    onSubmit: ({ value, meta }) =>
      props.onSubmit(cleanValue(value), meta.isDraft),
  })
  return (
    <form.AppForm>
      <FormScaffold
        form={form}
        isSubmitting={props.isSubmitting}
        canSaveAsDraft={!event || event.isDraft === true}
        onSubmit={(isDraft) => void form.handleSubmit({ isDraft })}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Event"
          isEditing={!!event}
        />
        <SpecificSection>
          <EventFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}
