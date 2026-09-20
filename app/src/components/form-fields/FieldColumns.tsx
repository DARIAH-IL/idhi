import { useLayoutEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const GAP_CLASSES = {
  2: 'gap-2 lg:gap-y-0',
  4: 'gap-4 lg:gap-y-0',
}

interface Props extends React.ComponentProps<'div'> {
  gap: keyof typeof GAP_CLASSES
}

function isHtmlElement(item: Element): item is HTMLElement {
  return item instanceof HTMLElement
}

function findSplit(heights: number[], rowGap: number) {
  if (heights.length < 2) {
    return heights.length
  }
  let best = 1
  let bestHeight = Number.POSITIVE_INFINITY
  for (let split = 1; split < heights.length; split += 1) {
    let first = 0
    let second = 0
    heights.forEach((height, index) => {
      if (index < split) {
        first += height + rowGap
      } else {
        second += height + rowGap
      }
    })
    const tallest = Math.max(first, second)
    if (tallest < bestHeight) {
      bestHeight = tallest
      best = split
    }
  }
  return best
}

export function FieldColumns({ gap, className, children, ...props }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    let split: number | null = null

    const fieldItems = () =>
      Array.from(container.children)
        .filter(isHtmlElement)
        .filter((item) => item.dataset.columnsRule === undefined)

    const rule = (orientation: string) =>
      container.querySelector<HTMLElement>(
        `:scope > [data-columns-rule="${orientation}"]`,
      )

    const place = (item: HTMLElement, column: string, row: string) => {
      if (item.style.gridColumn !== column) {
        item.style.gridColumn = column
      }
      if (item.style.gridRow !== row) {
        item.style.gridRow = row
      }
    }

    const show = (item: HTMLElement | null, visible: boolean) => {
      item?.toggleAttribute('data-active', visible)
      return Boolean(item) && visible
    }

    const layout = (recompute: boolean) => {
      const horizontal = rule('horizontal')
      const vertical = rule('vertical')
      const items = fieldItems()
      const styles = getComputedStyle(container)

      if (styles.display !== 'grid') {
        split = null
        for (const item of [...items, horizontal, vertical]) {
          if (item) {
            show(item, false)
            place(item, '', '')
          }
        }
        return
      }

      const rowGap = Math.round(Number.parseFloat(styles.columnGap) || 0)
      const measured = items.map((item) => ({
        item,
        fullWidth: item.dataset.fullWidth !== undefined,
        height: Math.max(1, Math.ceil(item.getBoundingClientRect().height)),
      }))
      const flow = measured.filter((entry) => !entry.fullWidth)
      const spanning = measured.filter((entry) => entry.fullWidth)

      const activeSplit =
        recompute || split === null || split > flow.length
          ? findSplit(
              flow.map((entry) => entry.height),
              rowGap,
            )
          : split
      split = activeSplit

      let leftFill = 0
      let rightFill = 0
      flow.forEach((entry, index) => {
        const isLeft = index < activeSplit
        const start = isLeft ? leftFill : rightFill
        place(
          entry.item,
          isLeft ? '1' : '3',
          `${start + 1} / span ${entry.height}`,
        )
        if (isLeft) {
          leftFill = start + entry.height + rowGap
        } else {
          rightFill = start + entry.height + rowGap
        }
      })

      const columnsHeight = Math.max(leftFill, rightFill) - rowGap
      const divided = activeSplit < flow.length

      if (show(vertical, divided && columnsHeight > 0) && vertical) {
        place(vertical, '2', `1 / span ${columnsHeight}`)
      } else if (vertical) {
        place(vertical, '', '')
      }

      let start = Math.max(leftFill, rightFill)

      if (show(horizontal, divided && spanning.length > 0) && horizontal) {
        const height = Math.max(
          1,
          Math.ceil(horizontal.getBoundingClientRect().height),
        )
        place(horizontal, '1 / -1', `${start + 1} / span ${height}`)
        start += height + rowGap
      } else if (horizontal) {
        place(horizontal, '', '')
      }

      for (const entry of spanning) {
        place(entry.item, '1 / -1', `${start + 1} / span ${entry.height}`)
        start += entry.height + rowGap
      }
    }

    let lastWidth = -1
    const containerObserver = new ResizeObserver(() => {
      const width = container.clientWidth
      if (width === lastWidth) {
        return
      }
      lastWidth = width
      layout(true)
    })

    const observed = new Set<Element>()
    const itemObserver = new ResizeObserver(() => layout(false))
    const syncItems = () => {
      const current = new Set<Element>(fieldItems())
      for (const item of observed) {
        if (!current.has(item)) {
          itemObserver.unobserve(item)
          observed.delete(item)
        }
      }
      for (const item of current) {
        if (!observed.has(item)) {
          itemObserver.observe(item)
          observed.add(item)
        }
      }
    }

    const mutationObserver = new MutationObserver(() => {
      syncItems()
      layout(true)
    })

    containerObserver.observe(container)
    syncItems()
    mutationObserver.observe(container, { childList: true })
    layout(true)

    return () => {
      containerObserver.disconnect()
      itemObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  return (
    <div
      {...props}
      ref={containerRef}
      className={cn(
        'flex flex-col lg:grid lg:auto-rows-[1px] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-start',
        GAP_CLASSES[gap],
        className,
      )}
    >
      {children}
      <div
        aria-hidden="true"
        data-columns-rule="vertical"
        className="hidden w-px self-stretch bg-border lg:data-[active]:block"
      />
      <div
        aria-hidden="true"
        data-columns-rule="horizontal"
        className="hidden h-px bg-border lg:data-[active]:block"
      />
    </div>
  )
}
