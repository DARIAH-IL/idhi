import { HugeiconsIcon } from '@hugeicons/react'
import { TranslateIcon } from '@hugeicons/core-free-icons'
import { useUIStore } from '@/stores/ui'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'

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

export function LangStringValue({ items }: { items: LangStringItem[] }) {
  const language = useUIStore((state) => state.language)

  const best =
    items.find((item) => item.language === language) ??
    items.find((item) => item.language === 'en') ??
    items[0]

  if (!best) {
    return null
  }

  const others = items.filter((item) => item !== best)

  const bestValue = best.value

  if (others.length === 0) {
    return best.language === language ? (
      bestValue
    ) : (
      <span lang={best.language}>{bestValue}</span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span lang={best.language === language ? undefined : best.language}>
        {bestValue}
      </span>
      <TooltipTrigger>
        <HugeiconsIcon
          icon={TranslateIcon}
          className="size-4 text-muted-foreground"
        />
        <Tooltip className="flex-col items-start gap-1">
          {others.map((item) => (
            <span key={item.language} lang={item.language}>
              {item.value}
            </span>
          ))}
        </Tooltip>
      </TooltipTrigger>
    </span>
  )
}
