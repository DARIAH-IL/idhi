import type { Entity, Project } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { useUIStore } from '@/stores/ui'
import { projectDefaults, projectFormOptions } from '../entity-form-options'
import { ProjectFields } from '../fields/ProjectFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold } from './FormScaffold'

interface Props {
  project?: Project & { isDraft?: boolean }
  title: React.ReactNode
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => Promise<unknown>
  onCancel: () => void
}

export function ProjectForm({ project, ...props }: Props) {
  const language = useUIStore((s) => s.language)
  const form = useAppForm({
    ...projectFormOptions,
    defaultValues: project ?? projectDefaults(language),
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
        canSaveAsDraft={!project || project.isDraft === true}
        onSubmit={(isDraft) => {
          form.handleSubmit({ isDraft }).catch(() => {})
        }}
        onCancel={props.onCancel}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Project"
        />
        <ProjectFields form={form} />
      </FormScaffold>
    </form.AppForm>
  )
}
