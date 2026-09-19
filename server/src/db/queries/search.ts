export const SEARCH_SCORE_FIELD = '_searchScore'

export function escapeWildcardQuery(value: string): string {
  return value.replace(/[\\*?]/g, '\\$&')
}

export function escapeRegExpQuery(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
