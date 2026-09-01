import type { Entity, Tool } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { useUIStore } from '@/stores/ui'
import { toolDefaults, toolFormOptions } from '../entity-form-options'
import { ToolFields } from '../fields/ToolFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold } from './FormScaffold'

interface Props {
  tool?: Tool & { isDraft?: boolean }
  title: React.ReactNode
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => void
  onCancel: () => void
}

export function ToolForm({ tool, ...props }: Props) {
  const language = useUIStore((s) => s.language)
  const form = useAppForm({
    ...toolFormOptions,
    defaultValues: tool ?? toolDefaults(language),
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
        canSaveAsDraft={!tool || tool.isDraft === true}
        onSubmit={(isDraft) => void form.handleSubmit({ isDraft })}
        onCancel={props.onCancel}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Tool"
        />
        <ToolFields form={form} />
      </FormScaffold>
    </form.AppForm>
  )
}
