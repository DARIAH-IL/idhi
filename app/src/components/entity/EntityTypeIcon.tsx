import { HugeiconsIcon } from '@hugeicons/react'
import {
  BookOpen01Icon,
  Building03Icon,
  Calendar03Icon,
  CustomerService01Icon,
  Database01Icon,
  File01Icon,
  FolderManagementIcon,
  LabsIcon,
  School01Icon,
  ToolsIcon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import type { EntityType } from '@/lib/entity'
import { cn } from '@/lib/utils'

const ICONS = {
  'idhi:Person': UserIcon,
  'idhi:Organization': Building03Icon,
  'idhi:Facility': LabsIcon,
  'idhi:Project': FolderManagementIcon,
  'idhi:Tool': ToolsIcon,
  'idhi:Service': CustomerService01Icon,
  'idhi:Publication': BookOpen01Icon,
  'idhi:Event': Calendar03Icon,
  'idhi:Dataset': Database01Icon,
  'idhi:TrainingMaterial': School01Icon,
} satisfies Record<EntityType, typeof UserIcon>

const COLORS = {
  'idhi:Person': 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  'idhi:Organization':
    'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'idhi:Facility':
    'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  'idhi:Project':
    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'idhi:Tool':
    'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  'idhi:Service':
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  'idhi:Publication':
    'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  'idhi:Event':
    'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  'idhi:Dataset':
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  'idhi:TrainingMaterial':
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
} satisfies Record<EntityType, string>

const SIZES = {
  sm: { wrapper: 'size-6 rounded-md', icon: 'size-3.5' },
  md: { wrapper: 'size-8 rounded-lg', icon: 'size-4' },
  lg: { wrapper: 'size-11 rounded-xl', icon: 'size-6' },
} as const

export function EntityTypeIcon({
  type,
  size = 'md',
  className,
}: {
  type: string
  size?: keyof typeof SIZES
  className?: string
}) {
  const knownType = type in ICONS ? (type as EntityType) : undefined
  const dimensions = SIZES[size]

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        dimensions.wrapper,
        knownType ? COLORS[knownType] : 'bg-muted text-muted-foreground',
        className,
      )}
      aria-hidden="true"
    >
      <HugeiconsIcon
        icon={knownType ? ICONS[knownType] : File01Icon}
        strokeWidth={1.8}
        className={dimensions.icon}
      />
    </span>
  )
}
