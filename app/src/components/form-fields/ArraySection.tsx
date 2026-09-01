import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useFieldContext } from '@/components/forms/form-context'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { DragHandle } from './DragHandle'
import { NestedFields, useFieldRowClass } from './FieldNesting'
import { focusAfterRemove } from './removeFocus'
import { useReorderableList } from './useReorderableList'

interface Props {
  label: React.ReactNode
  defaultItem: Record<string, unknown>
  children: (index: number) => React.ReactNode
}

export function ArraySection({ label, defaultItem, children }: Props) {
  const { t } = useTranslation()
  const field = useFieldContext<
    Array<Record<string, unknown>> | null | undefined
  >()
  const items = field.state.value ?? []
  const { getHandleProps, getRowProps } = useReorderableList(
    items.length,
    field.moveValue,
  )
  const rowClass = useFieldRowClass()
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef} data-remove-scope=""
      className={cn('flex flex-col gap-2 lg:[column-span:all]', rowClass)}
    >
      <Label>{label}</Label>
      <div className="ms-3 flex flex-col gap-3">
        {items.map((_, index) => (
          <div
            key={index}
            className="columns-1 gap-2 rounded border p-3 lg:columns-2 [&>*]:mb-2 [&>*]:break-inside-avoid"
            {...getRowProps(index)}
          >
            <div className="flex items-center justify-between [column-span:all]">
              <div className="flex items-center gap-2">
                <DragHandle {...getHandleProps(index)} />
                <span className="text-xs font-medium">#{index + 1}</span>
              </div>
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
            <NestedFields>{children(index)}</NestedFields>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          data-add-button
          onPress={() => field.pushValue(defaultItem)}
        >
          + {label}
        </Button>
      </div>
    </div>
  )
}
