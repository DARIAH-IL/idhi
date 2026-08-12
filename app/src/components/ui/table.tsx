import * as React from 'react'
import {
  Cell as CellPrimitive,
  Column as ColumnPrimitive,
  Row as RowPrimitive,
  TableBody as TableBodyPrimitive,
  TableFooter as TableFooterPrimitive,
  TableHeader as TableHeaderPrimitive,
  TableLoadMoreItem as TableLoadMoreItemPrimitive,
  Table as TablePrimitive,
} from 'react-aria-components'
import type {
  CellProps,
  ColumnProps,
  RowProps,
  TableBodyProps,
  TableFooterProps,
  TableHeaderProps,
  TableLoadMoreItemProps,
  TableProps,
} from 'react-aria-components'

import { cn } from '@/lib/utils'

type StyledTableProps = TableProps & {
  containerClassName?: string
}

function Table({
  className,
  containerClassName,
  ...props
}: StyledTableProps) {
  return (
    <div
      data-slot="table-container"
      className={cn('relative w-full overflow-x-auto', containerClassName)}
    >
      <TablePrimitive
        data-slot="table"
        className={cn('w-full caption-bottom text-xs', className)}
        {...props}
      />
    </div>
  )
}

function TableHeader<T>({ className, ...props }: TableHeaderProps<T>) {
  return (
    <TableHeaderPrimitive
      data-slot="table-header"
      className={cn('[&_tr]:border-b', className)}
      {...props}
    />
  )
}

function TableBody<T>({ className, ...props }: TableBodyProps<T>) {
  return (
    <TableBodyPrimitive
      data-slot="table-body"
      className={cn(
        'data-empty:h-24 data-empty:text-center [&_tr:last-child]:border-0',
        className,
      )}
      {...props}
    />
  )
}

function TableFooter<T>({ className, ...props }: TableFooterProps<T>) {
  return (
    <TableFooterPrimitive
      data-slot="table-footer"
      className={cn(
        'border-t bg-oklch(0.97 0 0)/50 font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  )
}

function TableRow<T>({ className, ...props }: RowProps<T>) {
  return (
    <RowPrimitive
      data-slot="table-row"
      className={cn(
        'border-b transition-colors hover:bg-oklch(0.97 0 0)/50 has-aria-expanded:bg-oklch(0.97 0 0)/50 data-[state=selected]:bg-oklch(0.97 0 0) data-selected:bg-oklch(0.97 0 0)',
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: ColumnProps) {
  return (
    <ColumnPrimitive
      data-slot="table-head"
      className={cn(
        'h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-oklch(0.145 0 0) [&:has([data-slot=checkbox])]:pr-0 [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: CellProps) {
  return (
    <CellPrimitive
      data-slot="table-cell"
      className={cn(
        'p-2 align-middle whitespace-nowrap [&:has([data-slot=checkbox])]:pr-0 [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  )
}

function TableLoadMoreItem({ className, ...props }: TableLoadMoreItemProps) {
  return (
    <TableLoadMoreItemPrimitive
      data-slot="table-load-more"
      className={cn(
        'h-10 text-center text-xs text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'figcaption'>) {
  return (
    <figcaption
      data-slot="table-caption"
      className={cn(
        'mt-4 text-center text-xs text-oklch(0.556 0 0)',
        className,
      )}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableLoadMoreItem,
  TableCaption,
}
