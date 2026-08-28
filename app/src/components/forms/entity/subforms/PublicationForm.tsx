import type { Entity, Publication } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import {
  publicationDefaults,
  publicationFormOptions,
} from '../entity-form-options'
import { PublicationFields } from '../fields/PublicationFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold, SpecificSection } from './FormScaffold'

interface Props {
  publication?: Publication & { isDraft?: boolean }
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => void
}

export function PublicationForm({ publication, ...props }: Props) {
  const form = useAppForm({
    ...publicationFormOptions,
    defaultValues: publication ?? publicationDefaults,
    onSubmitMeta: { isDraft: false },
    onSubmit: ({ value, meta }) =>
      props.onSubmit(cleanValue(value), meta.isDraft),
  })
  return (
    <form.AppForm>
      <FormScaffold
        form={form}
        isSubmitting={props.isSubmitting}
        canSaveAsDraft={!publication || publication.isDraft === true}
        onSubmit={(isDraft) => void form.handleSubmit({ isDraft })}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Publication"
          isEditing={!!publication}
        />
        <SpecificSection>
          <PublicationFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}
