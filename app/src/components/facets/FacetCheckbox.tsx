import { Checkbox } from 'react-aria-components'
import { HugeiconsIcon } from '@hugeicons/react'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { EntityImage } from '#/components/entity/EntityImage.tsx'
import type { ENTITY_TYPES } from '#/lib/entity.ts'

interface FacetCheckboxProps {
  label: string
  accessibleLabel: string
  entityType?: (typeof ENTITY_TYPES)[number]
  image?: string | null
  count: number
  isSelected?: boolean
  onChange: (isSelected: boolean) => void
}

export function FacetCheckbox({
  label,
  accessibleLabel,
  entityType,
  image,
  count,
  isSelected,
  onChange,
}: FacetCheckboxProps) {
  return (
    <Checkbox
      aria-label={`${accessibleLabel} (${count})`}
      isSelected={isSelected}
      onChange={onChange}
      className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
    >
      {({ isSelected: selected }) => (
        <>
          <span
            className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-background'
            }`}
          >
            {selected && (
              <HugeiconsIcon
                icon={Tick02Icon}
                strokeWidth={2.5}
                className="size-3"
                aria-hidden="true"
              />
            )}
          </span>
          {entityType && (
            <EntityImage
              image={image}
              type={entityType}
              alt=""
              size="sm"
              className="size-5 shrink-0 bg-transparent"
            />
          )}
          <span className="min-w-0 truncate text-xs">{label}</span>
          <span className="ms-auto text-xs tabular-nums text-muted-foreground">
            {count}
          </span>
        </>
      )}
    </Checkbox>
  )
}
