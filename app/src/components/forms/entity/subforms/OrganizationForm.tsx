import type { Entity, Organization } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import {
  organizationDefaults,
  organizationFormOptions,
} from '../entity-form-options'
import { OrganizationFields } from '../fields/OrganizationFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold, SpecificSection } from './FormScaffold'

interface Props {
  organization?: Organization & { isDraft?: boolean }
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => void
}

export function OrganizationForm({ organization, ...props }: Props) {
  const form = useAppForm({
    ...organizationFormOptions,
    defaultValues: organization ?? organizationDefaults,
    onSubmitMeta: { isDraft: false },
    onSubmit: ({ value, meta }) =>
      props.onSubmit(cleanValue(value), meta.isDraft),
  })
  return (
    <form.AppForm>
      <FormScaffold
        form={form}
        isSubmitting={props.isSubmitting}
        canSaveAsDraft={!organization || organization.isDraft === true}
        onSubmit={(isDraft) => void form.handleSubmit({ isDraft })}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Organization"
          isEditing={!!organization}
        />
        <SpecificSection>
          <OrganizationFields form={form} />
        </SpecificSection>
      </FormScaffold>
    </form.AppForm>
  )
}
