import { useTranslation } from 'react-i18next'
import { useFormContext } from './form-type'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FieldError } from './FieldError'
import { firstError, validateValue } from './validation'
import type { ValidationKind } from './validation'

export function StringArrayField({
  name,
  label,
  placeholder,
  validationKind,
  options,
}: {
  name: string
  label: string
  placeholder?: string
  validationKind?: ValidationKind
  options?: Record<string, string>
}) {
  const { t } = useTranslation()
  const form = useFormContext()

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <form.Field name={name as never} mode="array">
        {(field) => (
          <>
            <div className="flex flex-col gap-1.5">
              {(Array.isArray(field.state.value) ? field.state.value : []).map(
                (_, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <form.Field
                      name={`${name}[${i}]` as never}
                      validators={{
                        onBlur: ({ value }) => {
                          const formatError = validateValue(value, {
                            required: true,
                            kind: validationKind,
                          })
                          if (formatError) return formatError
                          return options &&
                            !Object.hasOwn(options, String(value))
                            ? 'Choose a supported value.'
                            : undefined
                        },
                        onSubmit: ({ value }) => {
                          const formatError = validateValue(value, {
                            required: true,
                            kind: validationKind,
                          })
                          if (formatError) return formatError
                          return options &&
                            !Object.hasOwn(options, String(value))
                            ? 'Choose a supported value.'
                            : undefined
                        },
                      }}
                    >
                      {(itemField) => (
                        <div className="flex-1">
                          <Input
                            value={
                              typeof itemField.state.value === 'string'
                                ? itemField.state.value
                                : ''
                            }
                            onChange={(event) =>
                              itemField.handleChange(
                                event.target.value as never,
                              )
                            }
                            placeholder={placeholder}
                            className="flex-1"
                            onBlur={itemField.handleBlur}
                            aria-invalid={Boolean(
                              firstError(itemField.state.meta.errors),
                            )}
                            list={options ? `${name}-options` : undefined}
                          />
                          <FieldError
                            error={firstError(itemField.state.meta.errors)}
                          />
                        </div>
                      )}
                    </form.Field>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onPress={() => field.removeValue(i)}
                      aria-label={t('common.remove')}
                    >
                      ×
                    </Button>
                  </div>
                ),
              )}
            </div>
            {options && (
              <datalist id={`${name}-options`}>
                {Object.keys(options).map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            )}
            <Button
              variant="outline"
              size="sm"
              onPress={() => field.pushValue('' as never)}
              className="w-fit"
            >
              + {t('entity.form.add_item')}
            </Button>
          </>
        )}
      </form.Field>
    </div>
  )
}
