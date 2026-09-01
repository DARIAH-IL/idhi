import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Combobox,
  ComboboxChip,
  ComboboxChipList,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { useAuthStore } from '@/stores/auth'
import {
  getAdvancedSearchEnumValueLabel,
  getAdvancedSearchFieldLabel,
  getFieldEnumValues,
  getFieldKind,
  getFieldOperators,
  getVisibleAdvancedSearchFieldKeys,
  isAdvancedSearchField,
  isFilterOperator,
  operatorTakesListValue,
} from '@/lib/advancedSearchFields.ts'
import type {
  AdvancedSearchField,
  AdvancedSearchFieldKind,
} from '@/lib/advancedSearchFields.ts'
import {
  addCondition,
  addGroup,
  compileAdvancedFilter,
  createGroupNode,
  removeNode,
  setGroupCombinator,
  updateCondition,
} from '@/lib/advancedFilterTree.ts'
import type {
  FilterConditionNode,
  FilterGroupNode,
  FilterNode,
} from '@/lib/advancedFilterTree.ts'

interface AdvancedSearchPanelProps {
  filter: FilterGroupNode | undefined
  activeCount: number
  isCollapsed: boolean
  onApply: (filter: FilterGroupNode | undefined) => void
  onClear: () => void
}

export function AdvancedSearchPanel({
  filter,
  activeCount,
  isCollapsed,
  onApply,
  onClear,
}: AdvancedSearchPanelProps) {
  const { t } = useTranslation()
  const [draftRoot, setDraftRoot] = useState<FilterGroupNode>(
    () => filter ?? createGroupNode(),
  )

  if (isCollapsed) {
    return null
  }

  function handleClear() {
    setDraftRoot(createGroupNode())
    onClear()
  }

  function handleApply() {
    onApply(compileAdvancedFilter(draftRoot) ? draftRoot : undefined)
  }

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
      <FilterGroupEditor
        root={draftRoot}
        setRoot={setDraftRoot}
        groupNode={draftRoot}
        depth={0}
        isRoot
      />

      <div className="flex justify-end gap-2 border-t pt-2">
        <Button
          size="sm"
          variant="outline"
          isDisabled={activeCount === 0}
          onPress={handleClear}
        >
          {t('common.clear')}
        </Button>
        <Button size="sm" onPress={handleApply}>
          {t('common.apply')}
        </Button>
      </div>
    </div>
  )
}

interface FilterGroupEditorProps {
  root: FilterGroupNode
  setRoot: (root: FilterGroupNode) => void
  groupNode: FilterGroupNode
  depth: number
  isRoot: boolean
}

function FilterGroupEditor({
  root,
  setRoot,
  groupNode,
  depth,
  isRoot,
}: FilterGroupEditorProps) {
  const { t } = useTranslation()

  return (
    <div
      className="rounded-md border p-2"
      style={{ marginInlineStart: depth * 16 }}
    >
      <div className="flex items-center gap-2">
        <div
          role="group"
          aria-label={t('board.advanced.combinator')}
          className="grid grid-cols-2 rounded-md bg-muted p-0.5"
        >
          {(['and', 'or'] as const).map((combinator) => (
            <Button
              key={combinator}
              size="xs"
              aria-pressed={groupNode.combinator === combinator}
              variant={
                groupNode.combinator === combinator ? 'outline' : 'ghost'
              }
              className={
                groupNode.combinator === combinator ? 'shadow-sm' : undefined
              }
              onPress={() =>
                setRoot(setGroupCombinator(root, groupNode.id, combinator))
              }
            >
              {t(`board.advanced.combinators.${combinator}`)}
            </Button>
          ))}
        </div>

        {!isRoot && (
          <Button
            size="icon-xs"
            variant="ghost"
            className="ms-auto"
            aria-label={t('board.advanced.remove_group')}
            onPress={() => setRoot(removeNode(root, groupNode.id))}
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              strokeWidth={2}
              aria-hidden="true"
            />
          </Button>
        )}
      </div>

      <div className="mt-2 space-y-2">
        {groupNode.children.map((child: FilterNode) =>
          child.kind === 'condition' ? (
            <FilterConditionRow
              key={child.id}
              node={child}
              onChange={(patch) =>
                setRoot(updateCondition(root, child.id, patch))
              }
              onRemove={() => setRoot(removeNode(root, child.id))}
            />
          ) : (
            <FilterGroupEditor
              key={child.id}
              root={root}
              setRoot={setRoot}
              groupNode={child}
              depth={depth + 1}
              isRoot={false}
            />
          ),
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <Button
          size="xs"
          variant="ghost"
          onPress={() => setRoot(addCondition(root, groupNode.id))}
        >
          {t('board.advanced.add_condition')}
        </Button>
        <Button
          size="xs"
          variant="ghost"
          onPress={() => setRoot(addGroup(root, groupNode.id))}
        >
          {t('board.advanced.add_group')}
        </Button>
      </div>
    </div>
  )
}

interface FilterConditionRowProps {
  node: FilterConditionNode
  onChange: (patch: Partial<Omit<FilterConditionNode, 'id' | 'kind'>>) => void
  onRemove: () => void
}

interface FieldOption {
  key: AdvancedSearchField
  label: string
}

function FilterConditionRow({
  node,
  onChange,
  onRemove,
}: FilterConditionRowProps) {
  const { t } = useTranslation()
  const isAdmin = useAuthStore((state) => state.user?.isAdmin === true)
  const kind = node.field ? getFieldKind(node.field) : undefined
  const operators = node.field ? getFieldOperators(node.field) : []
  const isListValue = node.operator
    ? operatorTakesListValue(node.operator)
    : false
  const fieldOptions: FieldOption[] = getVisibleAdvancedSearchFieldKeys(isAdmin)
    .map((field) => ({
      key: field,
      label: getAdvancedSearchFieldLabel(field),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Combobox
        aria-label={t('common.field')}
        defaultItems={fieldOptions}
        value={node.field || null}
        onChange={(key) => {
          const nextField = key == null ? '' : String(key)
          if (isAdvancedSearchField(nextField)) {
            onChange({ field: nextField, operator: '', value: undefined })
          } else if (!nextField) {
            onChange({ field: '', operator: '', value: undefined })
          }
        }}
        menuTrigger="focus"
      >
        <ComboboxInput
          className="w-56"
          placeholder={t('board.advanced.select_field')}
        />
        <ComboboxContent>
          <ComboboxList
            items={fieldOptions}
            renderEmptyState={() => (
              <ComboboxEmpty>{t('common.no_results')}</ComboboxEmpty>
            )}
          >
            {(item: FieldOption) => (
              <ComboboxItem id={item.key} textValue={item.label}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <Select
        aria-label={t('common.operator')}
        placeholder={t('board.advanced.select_operator')}
        isDisabled={!node.field}
        selectedKey={node.operator || null}
        onSelectionChange={(key) => {
          const nextOperator = String(key)
          if (isFilterOperator(nextOperator)) {
            onChange({ operator: nextOperator, value: undefined })
          }
        }}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map((operator) => (
            <SelectItem key={operator} id={operator}>
              {t(`board.advanced.operators.${operator}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {node.field && node.operator && node.operator !== 'exists' && (
        <ConditionValueEditor
          field={node.field}
          kind={kind}
          isListValue={isListValue}
          value={node.value}
          onChange={(value) => onChange({ value })}
        />
      )}

      {node.field && node.operator === 'exists' && (
        <Select
          aria-label={t('common.value')}
          placeholder={t('board.advanced.select_value')}
          selectedKey={
            typeof node.value === 'boolean' ? String(node.value) : null
          }
          onSelectionChange={(key) => onChange({ value: key === 'true' })}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem id="true">{t('board.advanced.exists_true')}</SelectItem>
            <SelectItem id="false">
              {t('board.advanced.exists_false')}
            </SelectItem>
          </SelectContent>
        </Select>
      )}

      <Button
        size="icon-xs"
        variant="ghost"
        aria-label={t('board.advanced.remove_condition')}
        onPress={onRemove}
      >
        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} aria-hidden="true" />
      </Button>
    </div>
  )
}

interface ConditionValueEditorProps {
  field: AdvancedSearchField
  kind: ReturnType<typeof getFieldKind> | undefined
  isListValue: boolean
  value: unknown
  onChange: (value: unknown) => void
}

function ConditionValueEditor({
  field,
  kind,
  isListValue,
  value,
  onChange,
}: ConditionValueEditorProps) {
  const { t } = useTranslation()

  if (!kind) {
    return null
  }

  if (kind === 'boolean') {
    return (
      <Select
        aria-label={t('common.value')}
        placeholder={t('board.advanced.select_value')}
        selectedKey={typeof value === 'boolean' ? String(value) : null}
        onSelectionChange={(key) => onChange(key === 'true')}
      >
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem id="true">{t('board.advanced.boolean_true')}</SelectItem>
          <SelectItem id="false">
            {t('board.advanced.boolean_false')}
          </SelectItem>
        </SelectContent>
      </Select>
    )
  }

  if (kind === 'enum') {
    const enumOptions: EnumOption[] = (getFieldEnumValues(field) ?? [])
      .map((enumValue) => ({
        key: enumValue,
        label: getAdvancedSearchEnumValueLabel(field, enumValue),
      }))
      .sort((a, b) => a.label.localeCompare(b.label))

    if (isListValue) {
      return (
        <EnumMultiValueEditor
          options={enumOptions}
          value={Array.isArray(value) ? value.map(String) : []}
          onChange={onChange}
        />
      )
    }

    return (
      <EnumSingleValueEditor
        options={enumOptions}
        value={typeof value === 'string' ? value : null}
        onChange={onChange}
      />
    )
  }

  if (kind === 'date') {
    return (
      <DatePicker
        value={typeof value === 'string' ? value : null}
        onChange={(nextValue) => onChange(nextValue || undefined)}
      />
    )
  }

  if (isListValue) {
    return (
      <FreeTextMultiValueEditor
        kind={kind}
        value={Array.isArray(value) ? value.map(String) : []}
        onChange={onChange}
      />
    )
  }

  return (
    <Input
      className="w-48"
      aria-label={t('common.value')}
      type={kind === 'number' ? 'number' : 'text'}
      value={value === undefined || value === null ? '' : String(value)}
      onChange={(event) => {
        const rawValue = event.target.value
        onChange(
          kind === 'number'
            ? rawValue === ''
              ? undefined
              : Number(rawValue)
            : rawValue,
        )
      }}
    />
  )
}

interface EnumOption {
  key: string
  label: string
}

interface EnumSingleValueEditorProps {
  options: EnumOption[]
  value: string | null
  onChange: (value: unknown) => void
}

function EnumSingleValueEditor({
  options,
  value,
  onChange,
}: EnumSingleValueEditorProps) {
  const { t } = useTranslation()

  return (
    <Combobox
      aria-label={t('common.value')}
      defaultItems={options}
      value={value}
      onChange={(key) => onChange(key == null ? undefined : String(key))}
      menuTrigger="focus"
    >
      <ComboboxInput
        className="w-48"
        placeholder={t('board.advanced.select_value')}
      />
      <ComboboxContent>
        <ComboboxList
          items={options}
          renderEmptyState={() => (
            <ComboboxEmpty>{t('common.no_results')}</ComboboxEmpty>
          )}
        >
          {(item: EnumOption) => (
            <ComboboxItem id={item.key} textValue={item.label}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

interface EnumMultiValueEditorProps {
  options: EnumOption[]
  value: string[]
  onChange: (value: unknown) => void
}

function EnumMultiValueEditor({
  options,
  value,
  onChange,
}: EnumMultiValueEditorProps) {
  const { t } = useTranslation()

  return (
    <Combobox
      aria-label={t('common.value')}
      selectionMode="multiple"
      defaultItems={options}
      value={value}
      onChange={(keys) => onChange(keys.map(String))}
      menuTrigger="focus"
    >
      <ComboboxChips>
        <ComboboxChipList aria-label={t('common.value')}>
          {(item: EnumOption) => (
            <ComboboxChip textValue={item.label}>{item.label}</ComboboxChip>
          )}
        </ComboboxChipList>
        <ComboboxChipsInput />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxList
          items={options}
          renderEmptyState={() => (
            <ComboboxEmpty>{t('common.no_results')}</ComboboxEmpty>
          )}
        >
          {(item: EnumOption) => (
            <ComboboxItem id={item.key} textValue={item.label}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

interface FreeTextMultiValueEditorProps {
  kind: AdvancedSearchFieldKind
  value: string[]
  onChange: (value: unknown) => void
}

function FreeTextMultiValueEditor({
  kind,
  value,
  onChange,
}: FreeTextMultiValueEditorProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const trimmedQuery = query.trim()
  const selectedOptions: EnumOption[] = value.map((item) => ({
    key: item,
    label: item,
  }))
  const hasExactMatch = value.some(
    (item) => item.toLowerCase() === trimmedQuery.toLowerCase(),
  )
  const isAddable =
    trimmedQuery !== '' &&
    !hasExactMatch &&
    (kind !== 'number' || !Number.isNaN(Number(trimmedQuery)))
  const items: EnumOption[] = isAddable
    ? [
        {
          key: trimmedQuery,
          label: t('entity.form.add_value', { term: trimmedQuery }),
        },
        ...selectedOptions,
      ]
    : selectedOptions

  return (
    <Combobox
      aria-label={t('common.value')}
      selectionMode="multiple"
      items={items}
      inputValue={query}
      onInputChange={setQuery}
      value={value}
      onChange={(keys) => {
        onChange(keys.map(String))
        setQuery('')
      }}
      menuTrigger="focus"
    >
      <ComboboxChips>
        <ComboboxChipList aria-label={t('common.value')}>
          {(item: EnumOption) => (
            <ComboboxChip textValue={item.label}>{item.label}</ComboboxChip>
          )}
        </ComboboxChipList>
        <ComboboxChipsInput
          placeholder={t('board.advanced.list_placeholder')}
        />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxList
          items={items}
          renderEmptyState={() => (
            <ComboboxEmpty>{t('common.no_results')}</ComboboxEmpty>
          )}
        >
          {(item: EnumOption) => (
            <ComboboxItem id={item.key} textValue={item.label}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
