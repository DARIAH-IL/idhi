import { createContext, useContext } from 'react'

const FieldNestingContext = createContext(0)

const HOVER_CLASSES = [
  'hover:bg-foreground/7',
  'hover:bg-foreground/10',
  'hover:bg-foreground/17',
  'hover:bg-foreground/22',
]

const PADDING_CLASSES = ['p-1', 'p-2', 'p-3', 'p-4']

function clampLevel(level: number, classes: string[]) {
  return classes[Math.min(level, classes.length - 1)]
}

export function useFieldHoverClass() {
  const level = useContext(FieldNestingContext)
  return clampLevel(level, HOVER_CLASSES)
}

export function useFieldRowClass() {
  const level = useContext(FieldNestingContext)
  return `rounded ${clampLevel(level, PADDING_CLASSES)} ${clampLevel(level, HOVER_CLASSES)}`
}

export function NestedFields({ children }: { children: React.ReactNode }) {
  const level = useContext(FieldNestingContext)
  return (
    <FieldNestingContext.Provider value={level + 1}>
      {children}
    </FieldNestingContext.Provider>
  )
}
