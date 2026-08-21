import { useTranslation } from 'react-i18next'
import { useFormContext } from '@/components/forms/form-context'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FieldError } from './FieldError'
import { firstError, validateValue } from './validation'

const LANGUAGES = ['en', 'he', 'ar'] as const

export function LangStringField({
  name,
  label,
  multiline = false,
  required = false,
}: {
  name: string
  label: string
  multiline?: boolean
  required?: boolean
}) {
  const { t } = useTranslation()
  const form = useFormContext()

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <form.Field
        name={name as never}
        mode="array"
        validators={{
          onSubmit: ({ value }) => {
            const items = value as unknown as Array<{
              language?: string
              value?: string
            }>
            if (required && (!Array.isArray(items) || items.length === 0))
              return 'Add at least one language value.'
            if (!Array.isArray(items)) return undefined
            const languages = items.map((item) => item.language)
            if (
              languages.some(
                (language) => !LANGUAGES.includes(language as never),
              )
            )
              return 'Choose a supported language.'
            if (new Set(languages).size !== languages.length)
              return 'Use each language only once.'
            return items.some((item) =>
              validateValue(item.value, { required: true }),
            )
              ? 'Every language value must have text.'
              : undefined
          },
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-2">
            <FieldError error={firstError(field.state.meta.errors)} />
            {(Array.isArray(field.state.value) ? field.state.value : []).map(
              (_, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <form.Field name={`${name}[${i}].language` as never}>
                    {(langField) => (
                      <Select
                        aria-label={t('entity.form.language')}
                        placeholder="lang"
                        selectedKey={
                          typeof langField.state.value === 'string'
                            ? langField.state.value
                            : null
                        }
                        onSelectionChange={(k) =>
                          langField.handleChange(k as never)
                        }
                      >
                        <SelectTrigger className="w-24 shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang} id={lang}>
                              {t(`entity.form.languages.${lang}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </form.Field>
                  <form.Field name={`${name}[${i}].value` as never}>
                    {(valField) =>
                      multiline ? (
                        <Textarea
                          value={
                            typeof valField.state.value === 'string'
                              ? valField.state.value
                              : ''
                          }
                          onChange={(event) =>
                            valField.handleChange(event.target.value as never)
                          }
                          className="flex-1"
                          rows={3}
                        />
                      ) : (
                        <Input
                          value={
                            typeof valField.state.value === 'string'
                              ? valField.state.value
                              : ''
                          }
                          onChange={(event) =>
                            valField.handleChange(event.target.value as never)
                          }
                          className="flex-1"
                        />
                      )
                    }
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
            <Button
              variant="outline"
              size="sm"
              onPress={() =>
                field.pushValue({ language: 'en', value: '' } as never)
              }
              className="w-fit"
            >
              + {t('entity.form.add_lang_string')}
            </Button>
          </div>
        )}
      </form.Field>
    </div>
  )
}
