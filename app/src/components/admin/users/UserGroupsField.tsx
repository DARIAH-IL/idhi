import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useListUserGroups } from '@/api/hooks/user-management/user-management'
import {
  Combobox,
  ComboboxChip,
  ComboboxChipList,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'

interface Option {
  key: string
  label: string
}

export function UserGroupsField({
  groups,
  onChange,
}: {
  groups: string[]
  onChange: (groups: string[]) => void
}) {
  const { t } = useTranslation()
  const labelId = useId()
  const { data: knownGroups, isPending } = useListUserGroups()
  const [query, setQuery] = useState('')
  const trimmed = query.trim()

  const items: Option[] = useMemo(() => {
    const seen = new Set<string>()
    const options: Option[] = []
    for (const value of [...(knownGroups ?? []), ...groups]) {
      if (!seen.has(value)) {
        seen.add(value)
        options.push({ key: value, label: value })
      }
    }

    if (!trimmed) {
      return options
    }

    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(trimmed.toLowerCase()),
    )
    const hasExactMatch = options.some(
      (option) => option.label.toLowerCase() === trimmed.toLowerCase(),
    )

    return hasExactMatch
      ? filtered
      : [
          {
            key: trimmed,
            label: t('entity.form.add_value', { term: trimmed }),
          },
          ...filtered,
        ]
  }, [knownGroups, groups, trimmed, t])

  return (
    <div className="grid gap-1.5">
      <Label id={labelId}>{t('admin.fields.groups')}</Label>
      <Combobox
        aria-labelledby={labelId}
        selectionMode="multiple"
        items={items}
        inputValue={query}
        onInputChange={setQuery}
        value={groups}
        onChange={(keys) => {
          onChange(keys.map(String))
          setQuery('')
        }}
        menuTrigger="focus"
      >
        <ComboboxChips>
          <ComboboxChipList aria-labelledby={labelId}>
            {(item: Option) => (
              <ComboboxChip textValue={item.label}>{item.label}</ComboboxChip>
            )}
          </ComboboxChipList>
          <ComboboxChipsInput />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxList
            items={items}
            renderEmptyState={() => (
              <ComboboxEmpty>
                {isPending ? t('common.loading') : t('common.no_results')}
              </ComboboxEmpty>
            )}
          >
            {(item) => (
              <ComboboxItem id={item.key} textValue={item.label}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <p className="text-xs text-muted-foreground">
        {t('admin.fields.groups_description')}
      </p>
    </div>
  )
}
