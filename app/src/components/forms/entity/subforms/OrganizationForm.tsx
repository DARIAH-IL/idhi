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
  organization?: Organization
  isSubmitting?: boolean
  onSubmit: (data: Entity) => void
}

export function OrganizationForm({ organization, ...props }: Props) {
  const form = useAppForm({
    ...organizationFormOptions,
    defaultValues: organization ?? organizationDefaults,
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
