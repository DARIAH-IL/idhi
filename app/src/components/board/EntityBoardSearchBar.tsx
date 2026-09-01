import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

interface EntityBoardSearchBarProps {
  searchInput: string
  onSearchInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  searchInputRef: RefObject<HTMLInputElement | null>
  onClearSearch: () => void
  children?: React.ReactNode
}

export function EntityBoardSearchBar({
  searchInput,
  onSearchInputChange,
  onSubmit,
  searchInputRef,
  onClearSearch,
  children,
}: EntityBoardSearchBarProps) {
  const { t } = useTranslation()

  return (
    <form
      role="search"
      aria-label={t('common.search')}
      onSubmit={onSubmit}
      className="flex gap-2"
    >
      <InputGroup className="max-w-sm">
        <InputGroupInput
          ref={searchInputRef}
          type="search"
          aria-label={t('common.search')}
          placeholder={t('common.search_placeholder')}
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          className="[&::-webkit-search-cancel-button]:hidden"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={t('board.clear_search')}
            isDisabled={!searchInput}
            onPress={onClearSearch}
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              strokeWidth={2}
              aria-hidden="true"
            />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <Button type="submit" variant="outline" size="default">
        {t('common.search')}
      </Button>

      {children}
    </form>
  )
}
