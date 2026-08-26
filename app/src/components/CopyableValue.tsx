import { Fragment, useState } from 'react'
import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function CopyableValue({ value }: { value: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded border bg-muted py-0.5 ps-1.5 pe-1 align-middle">
      <code dir="ltr" className="truncate font-mono text-xs">
        {value}
      </code>
      <button
        type="button"
        aria-label={copied ? t('common.copied') : t('common.copy')}
        title={copied ? t('common.copied') : t('common.copy')}
        onClick={() => {
          void navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
        className={cn(
          'inline-flex shrink-0 cursor-pointer items-center rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground',
          copied && 'text-primary hover:text-primary',
        )}
      >
        <HugeiconsIcon
          icon={copied ? Tick02Icon : Copy01Icon}
          strokeWidth={1.8}
          className="size-3"
        />
      </button>
    </span>
  )
}

export function TextWithValues({
  text,
  values,
}: {
  text: string
  values?: Record<string, string>
}) {
  const parts = text.split(/\{(\w+)\}/g)

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <CopyableValue key={index} value={values?.[part] ?? part} />
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  )
}
