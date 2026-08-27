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
  publication?: Publication
  isSubmitting?: boolean
  onSubmit: (data: Entity) => void
}

export function PublicationForm({ publication, ...props }: Props) {
  const form = useAppForm({
    ...publicationFormOptions,
    defaultValues: publication ?? publicationDefaults,
    onSubmit: ({ value }) => props.onSubmit(cleanValue(value)),
  })
  return (
    <form.AppForm>
      <FormScaffold
        form={form}
        isSubmitting={props.isSubmitting}
        onSubmit={() => void form.handleSubmit()}
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
