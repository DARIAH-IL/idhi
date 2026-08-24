import type { Entity, Project } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { projectDefaults, projectFormOptions } from '../entity-form-options'
import { ProjectFields } from '../fields/ProjectFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold, SpecificSection } from './FormScaffold'

interface Props {
  project?: Project
  isSubmitting?: boolean
  onSubmit: (data: Entity) => void
}

export function ProjectForm({ project, ...props }: Props) {
  const form = useAppForm({
    ...projectFormOptions,
    defaultValues: project ?? projectDefaults,
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
          entityType="idhi:Project"
          isEditing={!!project}
        />
        <SpecificSection>
          <ProjectFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}
