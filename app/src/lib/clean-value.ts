type CleanedValue<TValue> = TValue extends '' | null | undefined
  ? undefined
  : TValue extends Array<infer TItem>
    ? Array<Exclude<CleanedValue<TItem>, undefined>>
    : TValue extends object
      ? { [TKey in keyof TValue]: CleanedValue<TValue[TKey]> }
      : TValue

export function cleanValue<TValue>(value: TValue): CleanedValue<TValue>
export function cleanValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .map(cleanValue)
      .filter(
        (item) =>
          item !== undefined && !(Array.isArray(item) && item.length === 0),
      )
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([key, item]): [string, unknown] => [key, cleanValue(item)])
      .filter(
        ([, item]) =>
          item !== undefined && !(Array.isArray(item) && item.length === 0),
      )

    return Object.fromEntries(entries)
  }

  return value === '' || value === null || value === undefined
    ? undefined
    : value
}
