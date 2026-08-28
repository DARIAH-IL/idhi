import { createFieldMap } from '@tanstack/react-form'
import type { Person } from '@/api/models'
import { getEntityClassName } from '@/lib/entity'
import type { EntityType } from '@/lib/entity'
import { EntityFieldLabel } from '@/components/entity/EntityFieldLabel'
import { withFieldGroup } from '@/components/forms/app-form'

type CommonFields = Pick<Person, 'image' | 'tags'>

const commonDefaults: CommonFields = {
  image: undefined,
  tags: undefined,
}

export const commonFieldMap = createFieldMap(commonDefaults)

const commonGroupProps: { entityType: EntityType } = {
  entityType: 'idhi:Person',
}

export const CommonEntityFields = withFieldGroup({
  defaultValues: commonDefaults,
  props: commonGroupProps,
  render: function Render({ group, entityType }) {
    const entityClass = getEntityClassName(entityType)

    return (
      <>
        <group.AppField name="image">
          {(field) => <field.ImageField entityType={entityType} />}
        </group.AppField>
        <group.AppField name="tags">
          {(field) => (
            <field.StringArrayField
              label={
                <EntityFieldLabel entityClass={entityClass} field="tags" />
              }
            />
          )}
        </group.AppField>
      </>
    )
  },
})
