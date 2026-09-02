import type { Entity, Event } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { useUIStore } from '@/stores/ui'
import { eventDefaults, eventFormOptions } from '../entity-form-options'
import { EventFields } from '../fields/EventFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold } from './FormScaffold'

interface Props {
  event?: Event & { isDraft?: boolean }
  title: React.ReactNode
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => Promise<unknown>
  onCancel: () => void
}

export function EventForm({ event, ...props }: Props) {
  const language = useUIStore((s) => s.language)
  const form = useAppForm({
    ...eventFormOptions,
    defaultValues: event ?? eventDefaults(language),
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
        canSaveAsDraft={!event || event.isDraft === true}
        onSubmit={(isDraft) => {
          form.handleSubmit({ isDraft }).catch(() => {})
        }}
        onCancel={props.onCancel}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Event"
        />
        <EventFields form={form} />
      </FormScaffold>
    </form.AppForm>
  )
}
