export const SEARCH_SCORE_FIELD = '_searchScore'

export function escapeWildcardQuery(value: string): string {
  return value.replace(/[\\*?]/g, '\\$&')
}
