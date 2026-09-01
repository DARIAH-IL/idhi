import type { Entity, Organization } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { useAppForm } from '@/components/forms/app-form'
import { useUIStore } from '@/stores/ui'
import {
  organizationDefaults,
  organizationFormOptions,
} from '../entity-form-options'
import { OrganizationFields } from '../fields/OrganizationFields'
import { CommonEntityFields, commonFieldMap } from './common'
import { FormScaffold } from './FormScaffold'

interface Props {
  organization?: Organization & { isDraft?: boolean }
  title: React.ReactNode
  isSubmitting?: boolean
  onSubmit: (data: Entity, isDraft: boolean) => void
  onCancel: () => void
}

export function OrganizationForm({ organization, ...props }: Props) {
  const language = useUIStore((s) => s.language)
  const form = useAppForm({
    ...organizationFormOptions,
    defaultValues: organization ?? organizationDefaults(language),
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
        canSaveAsDraft={!organization || organization.isDraft === true}
        onSubmit={(isDraft) => void form.handleSubmit({ isDraft })}
        onCancel={props.onCancel}
      >
        <CommonEntityFields
          form={form}
          fields={commonFieldMap}
          entityType="idhi:Organization"
        />
        <OrganizationFields form={form} />
      </FormScaffold>
    </form.AppForm>
  )
}
