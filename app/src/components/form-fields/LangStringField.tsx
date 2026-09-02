import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFieldContext } from '@/components/forms/form-context'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
} from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  getLanguageOptions,
  isRtlLanguageCode,
  TOP_LANGUAGE_CODES,
} from '@/lib/languages'
import type { LanguageOption } from '@/lib/languages'
import { DragHandle } from './DragHandle'
import { FieldError } from './FieldError'
import { useFieldRowClass } from './FieldNesting'
import { focusAfterRemove } from './removeFocus'
import { useReorderableList } from './useReorderableList'
import { firstError } from './validation'

interface LocalizedValue {
  language: string
  value: string
}

interface Props {
  label: React.ReactNode
  required?: boolean
  multiline?: boolean
  onItemBlur?: (value: string) => void
}

interface LanguageComboboxProps {
  value: string
  onChange: (language: string) => void
  optionByCode: Map<string, LanguageOption>
  topLanguages: LanguageOption[]
  otherLanguages: LanguageOption[]
  languageFilter: (textValue: string, inputValue: string) => boolean
}

function LanguageCombobox({
  value,
  onChange,
  optionByCode,
  topLanguages,
  otherLanguages,
  languageFilter,
}: LanguageComboboxProps) {
  const { t } = useTranslation()
  const labelFor = (code: string) => optionByCode.get(code)?.label ?? code
  const [inputValue, setInputValue] = useState(() => labelFor(value))

  useEffect(() => {
    setInputValue(labelFor(value))
  }, [value])

  return (
    <Combobox
      aria-label={t('entity.form.language')}
      selectedKey={value || null}
      inputValue={inputValue}
      onInputChange={setInputValue}
      onSelectionChange={(key) => {
        if (key == null) {
          return
        }
        const code = String(key)
        onChange(code)
        setInputValue(labelFor(code))
      }}
      defaultFilter={languageFilter}
      className="w-32 shrink-0"
    >
      <ComboboxInput placeholder={t('entity.form.language_search')} />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxCollection items={topLanguages}>
              {(option) => (
                <ComboboxItem id={option.code}>{option.label}</ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxGroup>
          <ComboboxSeparator />
          <ComboboxGroup>
            <ComboboxCollection items={otherLanguages}>
              {(option) => (
                <ComboboxItem id={option.code}>{option.label}</ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxGroup>
          <ComboboxEmpty>{t('common.no_results')}</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function LangStringField({
  label,
  required = false,
  multiline = false,
  onItemBlur,
}: Props) {
  const { t } = useTranslation()
  const field = useFieldContext<LocalizedValue[] | null | undefined>()
  const items = field.state.value ?? []
  const rowClass = useFieldRowClass()
  const labelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const { getHandleProps, getRowProps } = useReorderableList(
    items.length,
    field.moveValue,
    containerRef,
  )

  const { topLanguages, otherLanguages, optionByCode, languageFilter } =
    useMemo(() => {
      const options = getLanguageOptions()
      const optionsByLabel = new Map(
        options.map((option) => [option.label, option]),
      )
      return {
        topLanguages: options.filter((option) =>
          TOP_LANGUAGE_CODES.includes(option.code),
        ),
        otherLanguages: options.filter(
          (option) => !TOP_LANGUAGE_CODES.includes(option.code),
        ),
        optionByCode: new Map(options.map((option) => [option.code, option])),
        languageFilter: (textValue: string, inputValue: string) => {
          try {
            const query = inputValue.trim().toLowerCase()
            if (!query) {
              return true
            }
            return (
              optionsByLabel.get(textValue)?.searchText ??
              textValue.toLowerCase()
            ).includes(query)
          } catch (error) {
            // A filter crash would otherwise silently break the combobox with no trace.
            // eslint-disable-next-line no-console
            console.error('[LangStringField] languageFilter threw', {
              textValue,
              inputValue,
              error,
            })
            return false
          }
        },
      }
    }, [])

  function updateItem(index: number, next: Partial<LocalizedValue>) {
    field.handleChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...next } : item,
      ),
    )
  }

  return (
    <div
      ref={containerRef}
      data-remove-scope=""
      className={cn('flex flex-col gap-2', rowClass)}
    >
      <Label id={labelId}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        )}
      </Label>
      <FieldError error={firstError(field.state.meta.errors)} />
      {items.map((item, index) => (
        <div
          key={index}
          className="flex gap-2 items-start"
          {...getRowProps(index)}
        >
          <DragHandle {...getHandleProps(index)} className="mt-1.5" />
          <LanguageCombobox
            value={item.language}
            onChange={(language) => updateItem(index, { language })}
            optionByCode={optionByCode}
            topLanguages={topLanguages}
            otherLanguages={otherLanguages}
            languageFilter={languageFilter}
          />
          {multiline ? (
            <Textarea
              aria-labelledby={labelId}
              aria-required={required || undefined}
              dir={isRtlLanguageCode(item.language) ? 'rtl' : 'ltr'}
              value={item.value}
              onChange={(event) =>
                updateItem(index, { value: event.target.value })
              }
              onBlur={() => onItemBlur?.(item.value)}
              className="flex-1"
              rows={3}
            />
          ) : (
            <Input
              aria-labelledby={labelId}
              aria-required={required || undefined}
              dir={isRtlLanguageCode(item.language) ? 'rtl' : 'ltr'}
              value={item.value}
              onChange={(event) =>
                updateItem(index, { value: event.target.value })
              }
              onBlur={() => onItemBlur?.(item.value)}
              className="flex-1"
            />
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            data-remove-button
            onPress={() => {
              void Promise.resolve(field.removeValue(index)).then(() =>
                focusAfterRemove(containerRef.current, index),
              )
            }}
            aria-label={`${t('common.remove')} (${index + 1})`}
          >
            ×
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        data-add-button
        onPress={() => field.pushValue({ language: 'en', value: '' })}
        className="w-fit"
      >
        + {t('entity.form.add_lang_string')}
      </Button>
    </div>
  )
}
