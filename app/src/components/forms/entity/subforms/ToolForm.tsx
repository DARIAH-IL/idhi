import type { Entity, Tool } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { toolDefaults, toolFormOptions } from '../entity-form-options'
import { ToolFields } from '../fields/ToolFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold, SpecificSection } from './FormScaffold'

interface Props {
  tool?: Tool
  isSubmitting?: boolean
  onSubmit: (data: Entity) => void
}

export function ToolForm({ tool, ...props }: Props) {
  const form = useAppForm({
    ...toolFormOptions,
    defaultValues: tool ?? toolDefaults,
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
