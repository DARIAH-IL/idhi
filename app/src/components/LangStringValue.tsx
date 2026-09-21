import { HugeiconsIcon } from '@hugeicons/react'
import { TranslateIcon } from '@hugeicons/core-free-icons'
import { useUIStore } from '@/stores/ui'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'
import { isRtlLanguageCode } from '@/lib/languages'

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

export function langStringDir(language: string | undefined) {
  if (!language) {
    return undefined
  }
  return isRtlLanguageCode(language) ? 'rtl' : 'ltr'
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
    return (
      <span
        lang={best.language}
        dir={langStringDir(best.language)}
        className="block text-start"
      >
        {bestValue}
      </span>
    )
  }

  return (
    <span
      lang={best.language}
      dir={langStringDir(best.language)}
      className="flex flex-wrap items-center gap-1.5 text-start"
    >
      <span>{bestValue}</span>
      <TooltipTrigger>
        <HugeiconsIcon
          icon={TranslateIcon}
          className="size-4 text-muted-foreground"
        />
        <Tooltip className="flex-col items-start gap-1">
          {others.map((item) => (
            <span
              key={item.language}
              lang={item.language}
              dir={langStringDir(item.language)}
              className="block text-start"
            >
              {item.value}
            </span>
          ))}
        </Tooltip>
      </TooltipTrigger>
    </span>
  )
}
