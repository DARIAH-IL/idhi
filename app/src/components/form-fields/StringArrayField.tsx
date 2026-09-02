import { useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useFieldContext } from '@/components/forms/form-context'
import { getEnumValueLabel } from '@/lib/entity'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { DragHandle } from './DragHandle'
import { FieldError } from './FieldError'
import { useFieldRowClass } from './FieldNesting'
import { focusAfterRemove } from './removeFocus'
import { useReorderableList } from './useReorderableList'
import { firstError } from './validation'

interface Props {
  label: React.ReactNode
  placeholder?: string
  options?: Record<string, string>
  type?: 'text' | 'url' | 'email'
}

export function StringArrayField({
  label,
  placeholder,
  options,
  type = 'text',
}: Props) {
  const { t } = useTranslation()
  const field = useFieldContext<string[] | null | undefined>()
  const items = field.state.value ?? []
  const rowClass = useFieldRowClass()
  const labelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const { getHandleProps, getRowProps } = useReorderableList(
    items.length,
    field.moveValue,
    containerRef,
  )

  return (
    <div
      ref={containerRef}
      data-remove-scope=""
      className={cn('flex flex-col gap-2', rowClass)}
    >
      <Label id={labelId}>{label}</Label>
      <FieldError error={firstError(field.state.meta.errors)} />
      <div className="flex flex-col gap-1.5">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex gap-2 items-center"
            {...getRowProps(index)}
          >
            <DragHandle {...getHandleProps(index)} />
            <Input
              type={type}
              aria-labelledby={labelId}
              dir={type === 'url' || type === 'email' ? 'ltr' : undefined}
              value={item}
              onChange={(event) =>
                field.handleChange(
                  items.map((value, itemIndex) =>
                    itemIndex === index ? event.target.value : value,
                  ),
                )
              }
              placeholder={placeholder}
              className="flex-1"
              list={options ? `${field.name}-options` : undefined}
            />
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
      </div>
      {options && (
        <datalist id={`${field.name}-options`}>
          {Object.keys(options).map((option) => (
            <option
              key={option}
              value={option}
              label={getEnumValueLabel(field.name, option)}
            />
          ))}
        </datalist>
      )}
      <Button
        variant="outline"
        size="sm"
        data-add-button
        onPress={() => field.pushValue('')}
        className="w-fit"
      >
        + {t('entity.form.add_item')}
      </Button>
    </div>
  )
}
