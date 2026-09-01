import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'
import type { EntitySort } from '../../api/entityBoardSearch.ts'

export function SortableColumnLabel({
  label,
  property,
  sort,
}: {
  label: string
  property: EntitySort['property']
  sort: EntitySort | undefined
}) {
  const direction = sort?.property === property ? sort.direction : undefined

  return (
    <span className="inline-flex items-center gap-1.5">
      {label}
      {direction && (
        <HugeiconsIcon
          icon={direction === 'asc' ? ArrowUp01Icon : ArrowDown01Icon}
          className="size-3.5"
          strokeWidth={2}
          aria-hidden="true"
        />
      )}
    </span>
  )
}
