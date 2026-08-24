import { createFieldMap } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import type { Person } from '@/api/models'
import { getEntityIdSegment } from '@/lib/entity'
import type { EntityType } from '@/lib/entity'
import { withFieldGroup } from '@/components/forms/app-form'
import {
  localizedValueValidators,
  stringArrayValidators,
  valueValidators,
} from '@/components/form-fields/validation'

type CommonFields = Pick<
  Person,
  'description' | 'homepage' | 'id' | 'image' | 'same_as' | 'tags'
>

const commonDefaults: CommonFields = {
  description: undefined,
  homepage: undefined,
  id: '',
  image: undefined,
  same_as: undefined,
  tags: undefined,
}

export const commonFieldMap = createFieldMap(commonDefaults)

const commonGroupProps: { entityType: EntityType; isEditing: boolean } = {
  entityType: 'idhi:Person',
  isEditing: false,
}

export const CommonEntityFields = withFieldGroup({
  defaultValues: commonDefaults,
  props: commonGroupProps,
  render: function Render({ group, entityType, isEditing }) {
    const { t } = useTranslation()

    return (
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t('entity.form.sections.basic')}
        </p>
        <group.AppField
          name="id"
          validators={valueValidators({
            required: isEditing,
            kind: 'entityId',
            entityTypes: [entityType],
          })}
        >
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.id')}
              placeholder={
                isEditing
                  ? `idhi:${getEntityIdSegment(entityType)}:…`
                  : t('entity.form.generated_id')
              }
              readOnly
              required={isEditing}
              className="font-mono text-xs"
            />
          )}
        </group.AppField>
        <group.AppField
          name="homepage"
          validators={valueValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.TextField
              label={t('entity.form.fields.homepage')}
              type="url"
              placeholder="https://…"
            />
          )}
        </group.AppField>
        <group.AppField name="image">
          {(field) => <field.ImageField entityType={entityType} />}
        </group.AppField>
        <group.AppField
          name="description"
          validators={localizedValueValidators()}
        >
          {(field) => (
            <field.LangStringField
              label={t('entity.form.fields.description')}
              multiline
            />
          )}
        </group.AppField>
        <group.AppField name="tags">
          {(field) => (
            <field.StringArrayField label={t('entity.form.fields.tags')} />
          )}
        </group.AppField>
        <group.AppField
          name="same_as"
          validators={stringArrayValidators({ kind: 'url' })}
        >
          {(field) => (
            <field.StringArrayField
              label={t('entity.form.fields.same_as')}
              placeholder="https://…"
            />
          )}
        </group.AppField>
      </div>
    )
  },
})
