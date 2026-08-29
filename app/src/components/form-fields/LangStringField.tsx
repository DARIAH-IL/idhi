import { useTranslation } from 'react-i18next'
import { useFieldContext } from '@/components/forms/form-context'
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
import { DragHandle } from './DragHandle'
import { FieldError } from './FieldError'
import { useReorderableList } from './useReorderableList'
import { firstError } from './validation'

const LANGUAGES = ['en', 'he', 'ar'] satisfies ReadonlyArray<'en' | 'he' | 'ar'>

interface LocalizedValue {
  language: string
  value: string
}

interface Props {
  label: React.ReactNode
  multiline?: boolean
}

export function LangStringField({ label, multiline = false }: Props) {
  const { t } = useTranslation()
  const field = useFieldContext<LocalizedValue[] | null | undefined>()
  const items = field.state.value ?? []
  const { getHandleProps, getRowProps } = useReorderableList(
    items.length,
    field.moveValue,
  )

  function updateItem(index: number, next: Partial<LocalizedValue>) {
    field.handleChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...next } : item,
      ),
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <FieldError error={firstError(field.state.meta.errors)} />
      {items.map((item, index) => (
        <div
          key={index}
          className="flex gap-2 items-start"
          {...getRowProps(index)}
        >
          <DragHandle {...getHandleProps(index)} className="mt-1.5" />
          <Select
            aria-label={t('entity.form.language')}
            selectedKey={item.language || null}
            onSelectionChange={(key) =>
              updateItem(index, { language: String(key) })
            }
          >
            <SelectTrigger className="w-24 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((language) => (
                <SelectItem key={language} id={language}>
                  {t(`entity.form.languages.${language}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {multiline ? (
            <Textarea
              value={item.value}
              onChange={(event) =>
                updateItem(index, { value: event.target.value })
              }
              className="flex-1"
              rows={3}
            />
          ) : (
            <Input
              value={item.value}
              onChange={(event) =>
                updateItem(index, { value: event.target.value })
              }
              className="flex-1"
            />
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onPress={() => field.removeValue(index)}
            aria-label={t('common.remove')}
          >
            ×
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onPress={() => field.pushValue({ language: 'en', value: '' })}
        className="w-fit"
      >
        + {t('entity.form.add_lang_string')}
      </Button>
    </div>
  )
}
