import type { EntityType } from '@/lib/entity'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EntityPicker } from './EntityPicker'
import { EntityReferenceCard } from './EntityReferenceCard'
import { FieldError } from './FieldError'
import { firstError, validateValue } from './validation'
import { useFormContext } from './form-type'

export function EntityRefField({
  name,
  label,
  entityTypes,
  required = false,
  allowExternalUrl = false,
}: {
  name: string
  label: string
  entityTypes: EntityType[]
  required?: boolean
  allowExternalUrl?: boolean
}) {
  const form = useFormContext()
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <form.Field
        name={name as never}
        validators={{
          onSubmit: ({ value }) =>
            allowExternalUrl &&
            typeof (value as unknown) === 'string' &&
            String(value).startsWith('http')
              ? validateValue(value, { required, kind: 'url' })
              : validateValue(value, {
                  required,
                  kind: 'entityId',
                  entityTypes,
                }),
        }}
      >
        {(field) => {
          const rawValue = field.state.value as unknown
          const value = typeof rawValue === 'string' ? rawValue : ''
          const error = firstError(field.state.meta.errors)
          return (
            <>
              <EntityPicker
                value={value.startsWith('idhi:') ? value : undefined}
                onChange={(next) => field.handleChange(next as never)}
                entityTypes={entityTypes}
                invalid={Boolean(error)}
              />
              {allowExternalUrl && (
                <Input
                  type="url"
                  value={value.startsWith('http') ? value : ''}
                  placeholder="Or enter an external URL…"
                  onChange={(event) =>
                    field.handleChange(event.target.value as never)
                  }
                  aria-invalid={Boolean(error)}
                />
              )}
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit"
                  onPress={() => field.handleChange('' as never)}
                >
                  Clear selection
                </Button>
              )}
              <FieldError error={error} />
            </>
          )
        }}
      </form.Field>
    </div>
  )
}

export function EntityRefArrayField({
  name,
  label,
  entityTypes,
}: {
  name: string
  label: string
  entityTypes: EntityType[]
}) {
  const form = useFormContext()
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <form.Field
        name={name as never}
        mode="array"
        validators={{
          onSubmit: ({ value }) => {
            if (!Array.isArray(value)) return undefined
            const ids = value as string[]
            if (new Set(ids).size !== ids.length)
              return 'Choose each entity only once.'
            return ids.some((id) =>
              validateValue(id, {
                required: true,
                kind: 'entityId',
                entityTypes,
              }),
            )
              ? 'One or more selected entities are invalid.'
              : undefined
          },
        }}
      >
        {(field) => {
          const values = Array.isArray(field.state.value)
            ? (field.state.value as string[])
            : []
          return (
            <>
              <FieldError error={firstError(field.state.meta.errors)} />
              {values.map((id, index) => (
                <div key={id} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <EntityReferenceCard entityId={id} />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onPress={() => field.removeValue(index)}
                    aria-label="Remove entity"
                  >
                    ×
                  </Button>
                </div>
              ))}
              <EntityPicker
                onChange={(id) => {
                  if (!values.includes(id)) field.pushValue(id as never)
                }}
                entityTypes={entityTypes}
              />
            </>
          )
        }}
      </form.Field>
    </div>
  )
}
