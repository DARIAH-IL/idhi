import type { Entity, Service } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { useUIStore } from '@/stores/ui'
import { serviceDefaults, serviceFormOptions } from '../entity-form-options'
import { ServiceFields } from '../fields/ServiceFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold } from './FormScaffold'

interface Props {
  service?: Service & { isDraft?: boolean }
  title: React.ReactNode
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => Promise<unknown>
  onCancel: () => void
}

export function ServiceForm({ service, ...props }: Props) {
  const language = useUIStore((s) => s.language)
  const form = useAppForm({
    ...serviceFormOptions,
    defaultValues: service ?? serviceDefaults(language),
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
        canSaveAsDraft={!service || service.isDraft === true}
        onSubmit={(isDraft) => {
          form.handleSubmit({ isDraft }).catch(() => {})
        }}
        onCancel={props.onCancel}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Service"
        />
        <ServiceFields form={form} />
      </FormScaffold>
    </form.AppForm>
  )
}
