import type { DragEvent, KeyboardEvent } from 'react'
import { useState } from 'react'

export function useReorderableList(
  itemCount: number,
  move: (from: number, to: number) => void,
) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  function getHandleProps(index: number) {
    return {
      draggable: true,
      onDragStart: (event: DragEvent) => {
        event.dataTransfer.effectAllowed = 'move'
        setDraggedIndex(index)
      },
      onDragEnd: () => setDraggedIndex(null),
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'ArrowUp' && index > 0) {
          event.preventDefault()
          move(index, index - 1)
        } else if (event.key === 'ArrowDown' && index < itemCount - 1) {
          event.preventDefault()
          move(index, index + 1)
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
