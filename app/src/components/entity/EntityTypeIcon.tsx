import { HugeiconsIcon } from '@hugeicons/react'
import {
  BookOpen01Icon,
  Building03Icon,
  Calendar03Icon,
  UngroupLayersIcon,
  Database01Icon,
  File01Icon,
  FolderManagementIcon,
  HierarchyIcon,
  GraduationCapIcon,
  DrawingCompassIcon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import type { EntityType } from '@/lib/entity'
import { cn } from '@/lib/utils'

const ICONS = {
  'idhi:Person': UserIcon,
  'idhi:Organization': Building03Icon,
  'idhi:Facility': HierarchyIcon,
  'idhi:Project': FolderManagementIcon,
  'idhi:Tool': DrawingCompassIcon,
  'idhi:Service': UngroupLayersIcon,
  'idhi:Publication': BookOpen01Icon,
  'idhi:Event': Calendar03Icon,
  'idhi:Dataset': Database01Icon,
  'idhi:TrainingMaterial': GraduationCapIcon,
} satisfies Record<EntityType, typeof UserIcon>

const COLORS = {
  'idhi:Person': 'bg-sky-100 text-sky-700',
  'idhi:Organization': 'bg-violet-100 text-violet-700',
  'idhi:Facility': 'bg-teal-100 text-teal-700',
  'idhi:Project': 'bg-amber-100 text-amber-700',
  'idhi:Tool': 'bg-slate-200 text-slate-700',
  'idhi:Service': 'bg-cyan-100 text-cyan-700',
  'idhi:Publication': 'bg-rose-100 text-rose-700',
  'idhi:Event': 'bg-orange-100 text-orange-700',
  'idhi:Dataset': 'bg-indigo-100 text-indigo-700',
  'idhi:TrainingMaterial': 'bg-emerald-100 text-emerald-700',
} satisfies Record<EntityType, string>

const SIZES = {
  sm: { wrapper: 'size-6 rounded-md', icon: 'size-3.5' },
  md: { wrapper: 'size-8 rounded-lg', icon: 'size-4' },
  lg: { wrapper: 'size-11 rounded-xl', icon: 'size-6' },
} as const

function isEntityType(type: string): type is EntityType {
  return type in ICONS
}

export function EntityTypeIcon({
  type,
  size = 'md',
  className,
}: {
  type: string
  size?: keyof typeof SIZES
  className?: string
}) {
  const knownType = isEntityType(type) ? type : undefined
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
