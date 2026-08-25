import { HugeiconsIcon } from '@hugeicons/react'
import { TranslateIcon } from '@hugeicons/core-free-icons'
import { useUIStore } from '@/stores/ui'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'
import { ExternalLink } from '@/components/ExternalLink'

export interface LangStringItem {
  language: string
  value: string
}

export function langStringsOf(v: unknown): LangStringItem[] {
  const items = Array.isArray(v) ? v : [v]
  const result: LangStringItem[] = []
  for (const item of items) {
    if (
      item !== null &&
      typeof item === 'object' &&
      'language' in item &&
      'value' in item &&
      typeof item.language === 'string' &&
      typeof item.value === 'string'
    ) {
      result.push({ language: item.language, value: item.value })
    }
  }
  return result
}

export function LangStringValue({
  items,
  hrefOf,
}: {
  items: LangStringItem[]
  hrefOf?: (value: string) => string
}) {
  const language = useUIStore((state) => state.language)

  const best =
    items.find((item) => item.language === language) ??
    items.find((item) => item.language === 'en') ??
    items[0]

  if (!best) {
    return null
  }

  const others = items.filter((item) => item !== best)

  const bestValue = hrefOf ? (
    <ExternalLink href={hrefOf(best.value)}>{best.value}</ExternalLink>
  ) : (
    best.value
  )

  if (others.length === 0) {
    return bestValue
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {bestValue}
      <TooltipTrigger>
        <HugeiconsIcon
          icon={TranslateIcon}
          className="size-4 text-muted-foreground"
        />
        <Tooltip className="flex-col items-start gap-1">
          {others.map((item) => (
            <span key={item.language}>{item.value}</span>
          ))}
        </Tooltip>
      </TooltipTrigger>
    </span>
  )
}
