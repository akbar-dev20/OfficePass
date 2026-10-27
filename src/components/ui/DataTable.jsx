import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import EmptyState from './EmptyState'
import ErrorState from './ErrorState'

/**
 * DataTable — reusable table with search, column filters, pagination and
 * loading / empty / error states. Phase 1 operates fully client-side on the
 * `data` prop; Phase 3 pages will pass server-fetched rows.
 *
 * columns: [{ key, header, render?, width? }]
 * filters: [{ key, label, options: string[] }]
 */
export default function DataTable({
  columns,
  data = [],
  searchKeys = [],
  filters = [],
  pageSize = 10,
  loading = false,
  error = null,
  onRetry = null,
  emptyTitle = 'Nothing here yet',
  emptyDescription = null,
  dense = false,
}) {
  const [query, setQuery] = useState('')
  const [filterValues, setFilterValues] = useState({})
  const [page, setPage] = useState(1)

  // Reset to the first page whenever the query or filters change
  useEffect(() => {
    setPage(1)
  }, [query, filterValues])

  const filtered = useMemo(() => {
    let rows = data
    const q = query.trim().toLowerCase()
    if (q && searchKeys.length > 0) {
      rows = rows.filter((row) =>
        searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)),
      )
    }
    for (const filter of filters) {
      const selected = filterValues[filter.key]
      if (selected) rows = rows.filter((row) => String(row[filter.key]) === selected)
    }
    return rows
  }, [data, query, filterValues, searchKeys, filters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const firstRow = (safePage - 1) * pageSize + 1
  const lastRow = Math.min(safePage * pageSize, filtered.length)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
  const hasActiveFilters = Boolean(query) || Object.values(filterValues).some(Boolean)

  const clearAll = () => {
    setQuery('')
    setFilterValues({})
    setPage(1)
  }
  return (
    <div className="datatable">
      <div className="table-toolbar">
        {searchKeys.length > 0 && (
          <div className="table-search">
            <Search size={16} aria-hidden="true" />
            <input
              className="input"
              type="search"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search records"
            />
          </div>
        )}
        {filters.map((filter) => (
          <select
            key={filter.key}
            className="select table-filter"
            value={filterValues[filter.key] || ''}
            onChange={(e) =>
              setFilterValues((prev) => ({ ...prev, [filter.key]: e.target.value }))
            }
            aria-label={`Filter by ${filter.label}`}
          >
            <option value="">{filter.label}: All</option>
            {filter.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ))}
        {hasActiveFilters && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={clearAll}>
            Clear
          </button>
        )}
      </div>
      {error ? (
        <ErrorState
          title="Couldn't load records"
          description={error}
          onRetry={onRetry ? () => onRetry() : undefined}
        />
      ) : loading ? (
        <div className="table-loading" aria-hidden="true">
          {Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
            <div key={i} className="skeleton table-skeleton-row" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <div className="table-wrapper">
            <table className={`data-table${dense ? ' data-table--dense' : ''}`}>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} style={column.width ? { width: column.width } : undefined}>
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, index) => (
                  <tr key={row.id ?? index}>
                    {columns.map((column) => (
                      <td key={column.key}>
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-pagination">
            <span aria-live="polite">
              Showing {firstRow}–{lastRow} of {filtered.length}
            </span>
            <div className="table-pagination__pages">
              <button
                type="button"
                className="icon-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
