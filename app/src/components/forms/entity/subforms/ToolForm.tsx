import type { Entity, Tool } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { toolDefaults, toolFormOptions } from '../entity-form-options'
import { ToolFields } from '../fields/ToolFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold, SpecificSection } from './FormScaffold'

interface Props {
  tool?: Tool & { isDraft?: boolean }
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => void
}

export function ToolForm({ tool, ...props }: Props) {
  const form = useAppForm({
    ...toolFormOptions,
    defaultValues: tool ?? toolDefaults,
    onSubmitMeta: { isDraft: false },
    onSubmit: ({ value, meta }) =>
      props.onSubmit(cleanValue(value), meta.isDraft),
  })
  return (
    <form.AppForm>
      <FormScaffold
        form={form}
        isSubmitting={props.isSubmitting}
        canSaveAsDraft={!tool || tool.isDraft === true}
        onSubmit={(isDraft) => void form.handleSubmit({ isDraft })}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Tool"
          isEditing={!!tool}
        />
        <SpecificSection>
          <ToolFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}
