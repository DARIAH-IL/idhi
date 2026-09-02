import type { DragEvent, KeyboardEvent, RefObject } from 'react'
import { useState } from 'react'

function focusHandleAfterMove(
  container: HTMLElement | null | undefined,
  index: number,
) {
  requestAnimationFrame(() => {
    if (!container) {
      return
    }
    const inScope = (el: HTMLElement) =>
      el.closest('[data-remove-scope]') === container
    const handles = Array.from(
      container.querySelectorAll<HTMLElement>('[data-drag-handle]'),
    ).filter(inScope)
    handles[index]?.focus()
  })
}

export function useReorderableList(
  itemCount: number,
  move: (from: number, to: number) => void,
  containerRef?: RefObject<HTMLElement | null>,
) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  function getHandleProps(index: number) {
    return {
      draggable: true,
      'data-drag-handle': true,
      onDragStart: (event: DragEvent) => {
        event.dataTransfer.effectAllowed = 'move'
        setDraggedIndex(index)
      },
      onDragEnd: () => setDraggedIndex(null),
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'ArrowUp' && index > 0) {
          event.preventDefault()
          move(index, index - 1)
          focusHandleAfterMove(containerRef?.current, index - 1)
        } else if (event.key === 'ArrowDown' && index < itemCount - 1) {
          event.preventDefault()
          move(index, index + 1)
          focusHandleAfterMove(containerRef?.current, index + 1)
        }
      },
    }
  }

  function getRowProps(index: number) {
    return {
      onDragOver: (event: DragEvent) => {
        if (draggedIndex === null) {
          return
        }
        event.preventDefault()
      },
      onDrop: (event: DragEvent) => {
        event.preventDefault()
        if (draggedIndex !== null && draggedIndex !== index) {
          move(draggedIndex, index)
        }
        setDraggedIndex(null)
      },
    }
  }

  return { draggedIndex, getHandleProps, getRowProps }
}
