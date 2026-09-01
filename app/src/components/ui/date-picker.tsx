import { useId, useMemo, useRef, useState } from 'react'
import { getLocalTimeZone, parseDate } from '@internationalized/date'
import type { CalendarDate } from '@internationalized/date'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { useLocale } from 'react-aria-components'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value?: string | null
  onChange: (value: string) => void
  onBlur?: () => void
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-invalid'?: boolean
  className?: string
}

function parseValue(value: string | null | undefined) {
  if (!value) {
    return null
  }

  try {
    return parseDate(value)
  } catch {
    return null
  }
}

function DatePicker({
  value,
  onChange,
  onBlur,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-invalid': ariaInvalid,
  className,
}: DatePickerProps) {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const valueId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const date = parseValue(value)
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    [locale],
  )

  function closeAndBlur() {
    setOpen(false)
    onBlur?.()
  }

  function selectDate(nextDate: CalendarDate) {
    onChange(nextDate.toString())
    closeAndBlur()
  }

  return (
    <div className={cn('flex w-fit items-center gap-1', className)}>
      <PopoverTrigger
        isOpen={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            onBlur?.()
          }
        }}
      >
        <Button
          ref={triggerRef}
          variant="outline"
          aria-label={ariaLabel}
          aria-labelledby={
            ariaLabelledBy ? `${ariaLabelledBy} ${valueId}` : undefined
          }
          aria-invalid={ariaInvalid}
          className="min-w-36 justify-start font-normal"
        >
          <span id={valueId}>
            {date
              ? formatter.format(date.toDate(getLocalTimeZone()))
              : t('common.date_picker.select')}
          </span>
        </Button>
        <Popover
          aria-label={ariaLabel ?? t('common.date_picker.select')}
          className="w-auto overflow-hidden bg-popover p-0 text-popover-foreground"
          placement="bottom start"
        >
          <Calendar
            value={date}
            captionLayout="dropdown"
            onChange={selectDate}
          />
        </Popover>
      </PopoverTrigger>
      {date ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('common.date_picker.clear')}
          onPress={() => {
            onChange('')
            onBlur?.()
            triggerRef.current?.focus()
          }}
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            strokeWidth={2}
            aria-hidden="true"
          />
        </Button>
      ) : null}
    </div>
  )
}

export { DatePicker }
