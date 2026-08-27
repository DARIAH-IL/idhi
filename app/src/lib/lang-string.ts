export interface LangStringItem {
  language: string
  value: string
}

export function langString(value: string): LangStringItem[] {
  return [{ language: 'en', value }]
}

export function hasLangStringValue(
  items: LangStringItem[] | null | undefined,
): boolean {
  return Boolean(items?.some((item) => item.value.trim()))
}
