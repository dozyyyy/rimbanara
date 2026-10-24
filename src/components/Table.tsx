import type { ReactNode } from 'react'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Search,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cardClass, inputClass, secondaryButtonClass } from './uiClasses.ts'

export interface TableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

export interface TablePagination {
  page: number
  pageCount: number
  total: number
  onPageChange: (page: number) => void
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  emptyIcon?: LucideIcon
  emptyAction?: ReactNode
  toolbar?: ReactNode
  pagination?: TablePagination
}

/** Builds a small window of page numbers around the current page. */
function visiblePages(page: number, pageCount: number): number[] {
  const windowSize = 5
  if (pageCount <= windowSize) {
    return Array.from({ length: pageCount }, (_, index) => index)
  }
  const start = Math.min(
    Math.max(page - Math.floor(windowSize / 2), 0),
    pageCount - windowSize,
  )
  return Array.from({ length: windowSize }, (_, index) => start + index)
}

export default function Table<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  error = null,
  emptyMessage = 'Tidak ada data.',
  emptyIcon: EmptyIcon = Leaf,
  emptyAction,
  toolbar,
  pagination,
}: TableProps<T>) {
  const columnCount = columns.length
  const pages = pagination
    ? visiblePages(pagination.page, Math.max(pagination.pageCount, 1))
    : []

  return (
    <section className={`${cardClass} overflow-hidden`}>
      {toolbar ? (
        <div className="border-b border-cream-200 p-4 sm:p-5">{toolbar}</div>
      ) : null}

      <div className="relative overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-cream-50/80">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 text-[10px] font-semibold tracking-[0.14em] whitespace-nowrap text-stone-500 uppercase first:pl-5 last:pr-5 ${column.className ?? ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody aria-busy={loading}>
            {loading ? (
              Array.from({ length: 4 }, (_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="border-t border-cream-100">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3.5 first:pl-5 last:pr-5">
                      <div
                        className="skeleton h-3.5 rounded-full"
                        style={{ width: rowIndex % 2 === 0 ? '70%' : '55%' }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columnCount} className="px-5 py-14">
                  <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
                      <AlertCircle size={20} aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm font-medium text-stone-800">
                      Data gagal dimuat
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-500">
                      {error}
                    </p>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-5 py-14">
                  <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-100 text-brand-500">
                      <EmptyIcon size={22} aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm font-medium text-stone-800">
                      {emptyMessage}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-500">
                      {emptyAction
                        ? 'Data yang Anda tambahkan akan muncul di sini.'
                        : 'Coba ubah kata kunci atau filter status.'}
                    </p>
                    {emptyAction ? <div className="mt-4">{emptyAction}</div> : null}
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-t border-cream-100 transition-colors hover:bg-cream-50/70"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 align-middle first:pl-5 last:pr-5 ${
                        column.className ?? ''
                      }`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination ? (
        <div className="flex flex-col gap-3 border-t border-cream-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-stone-500">
            Halaman{' '}
            <span className="font-medium text-stone-700">
              {pagination.page + 1}
            </span>{' '}
            dari{' '}
            <span className="font-medium text-stone-700">
              {Math.max(pagination.pageCount, 1)}
            </span>{' '}
            · {pagination.total} data
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={`${secondaryButtonClass} px-2.5 py-1.5`}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 0 || loading}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
            {pages.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => pagination.onPageChange(page)}
                aria-label={`Buka halaman ${page + 1}`}
                aria-current={page === pagination.page ? 'page' : undefined}
                className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition ${
                  page === pagination.page
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-cream-100'
                }`}
              >
                {page + 1}
              </button>
            ))}
            <button
              type="button"
              className={`${secondaryButtonClass} px-2.5 py-1.5`}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={
                loading || pagination.page >= Math.max(pagination.pageCount, 1) - 1
              }
              aria-label="Halaman berikutnya"
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export interface TableToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  statusFilter: 'all' | 'published' | 'draft'
  onStatusFilterChange: (value: 'all' | 'published' | 'draft') => void
  action?: ReactNode
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'published', label: 'Terbit' },
  { value: 'draft', label: 'Draft' },
] as const

/** Search + publish-status filter shown above the table (PRD §8.2). */
export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Cari nama...',
  statusFilter,
  onStatusFilterChange,
  action,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative min-w-56 flex-1">
        <Search
          size={15}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-stone-400"
        />
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className={`${inputClass} pl-9`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="Filter status terbit"
          className="inline-flex rounded-xl border border-cream-200 bg-cream-50 p-1"
        >
          {STATUS_OPTIONS.map((option) => {
            const active = option.value === statusFilter
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => onStatusFilterChange(option.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'bg-white text-brand-800 shadow-sm ring-1 ring-cream-200'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
        {action}
      </div>
    </div>
  )
}
