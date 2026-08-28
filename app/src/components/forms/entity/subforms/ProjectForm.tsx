import type { Entity, Project } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { projectDefaults, projectFormOptions } from '../entity-form-options'
import { ProjectFields } from '../fields/ProjectFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold, SpecificSection } from './FormScaffold'

interface Props {
  project?: Project & { isDraft?: boolean }
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => void
}

export function ProjectForm({ project, ...props }: Props) {
  const form = useAppForm({
    ...projectFormOptions,
    defaultValues: project ?? projectDefaults,
    onSubmitMeta: { isDraft: false },
    onSubmit: ({ value, meta }) =>
      props.onSubmit(cleanValue(value), meta.isDraft),
  })
  return (
    <form.AppForm>
      <FormScaffold
        form={form}
        isSubmitting={props.isSubmitting}
        canSaveAsDraft={!project || project.isDraft === true}
        onSubmit={(isDraft) => void form.handleSubmit({ isDraft })}
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
