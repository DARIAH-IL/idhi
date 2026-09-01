import type { Entity, Publication } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { useUIStore } from '@/stores/ui'
import {
  publicationDefaults,
  publicationFormOptions,
} from '../entity-form-options'
import { PublicationFields } from '../fields/PublicationFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold } from './FormScaffold'

interface Props {
  publication?: Publication & { isDraft?: boolean }
  title: React.ReactNode
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => void
  onCancel: () => void
}

export function PublicationForm({ publication, ...props }: Props) {
  const language = useUIStore((s) => s.language)
  const form = useAppForm({
    ...publicationFormOptions,
    defaultValues: publication ?? publicationDefaults(language),
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
        canSaveAsDraft={!publication || publication.isDraft === true}
        onSubmit={(isDraft) => void form.handleSubmit({ isDraft })}
        onCancel={props.onCancel}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Publication"
        />
        <PublicationFields form={form} />
      </FormScaffold>
    </form.AppForm>
  )
}
