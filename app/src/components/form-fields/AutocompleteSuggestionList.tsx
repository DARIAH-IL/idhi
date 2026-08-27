import { useTranslation } from 'react-i18next'

interface Props<T> {
  items: T[]
  loading: boolean
  searched: boolean
  activeIndex: number
  getItemKey: (item: T) => string
  renderItem: (item: T) => React.ReactNode
  onPick: (item: T) => void
}

export function AutocompleteSuggestionList<T>({
  items,
  loading,
  searched,
  activeIndex,
  getItemKey,
  renderItem,
  onPick,
}: Props<T>) {
  const { t } = useTranslation()

  return (
    <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
      {loading && (
        <p className="px-2 py-1.5 text-xs text-muted-foreground">
          {t('entity.picker.searching')}
        </p>
      )}
      {!loading && searched && items.length === 0 && (
        <p className="px-2 py-1.5 text-xs text-muted-foreground">
          {t('entity.form.autocomplete_no_results')}
        </p>
      )}
      {items.map((item, index) => (
        <button
          key={getItemKey(item)}
          type="button"
          className={`block w-full rounded px-2 py-2 text-left hover:bg-accent ${
            index === activeIndex ? 'bg-accent' : ''
          }`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onPick(item)}
        >
          {renderItem(item)}
        </button>
      ))}
    </div>
  )
}
