import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { TableColumnFilter } from './TableColumnFilter';
import { TableSearchBar } from './TableSearchBar';
import { useLanguage } from '../i18n/useLanguage';

export function EntityTable({ rows, keyField = 'id', columns, renderActions }) {
  const { t } = useLanguage();
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const columnDefs = useMemo(() => {
    const defs = columns.map((col, index) => ({
      id: col.sortKey ?? `col-${index}`,
      header: col.label,
      accessorFn: (row) => (col.sortValue ? col.sortValue(row) : col.render(row)),
      enableSorting: Boolean(col.sortKey),
      sortingFn: (a, b, columnId) =>
        String(a.getValue(columnId) ?? '').localeCompare(String(b.getValue(columnId) ?? ''), undefined, {
          sensitivity: 'base',
        }),
      cell: ({ row }) => col.render(row.original),
    }));

    if (renderActions) {
      defs.push({
        id: 'actions',
        header: t.common.actions,
        enableSorting: false,
        enableGlobalFilter: false,
        enableColumnFilter: false,
        cell: ({ row }) => renderActions(row.original),
      });
    }

    return defs;
  }, [columns, renderActions, t]);

  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowId: (row) => row[keyField],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const headerGroup = table.getHeaderGroups()[0];

  return (
    <div className="shifts-table-wrap">
      <TableSearchBar
        value={globalFilter}
        onChange={setGlobalFilter}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((prev) => !prev)}
      />
      <div className="table-scroll">
        <table className="shifts-table">
          <thead>
            <tr>
              {headerGroup.headers.map((header) => {
                const sortable = header.column.getCanSort();
                return (
                  <th
                    key={header.id}
                    className={sortable ? 'sortable' : undefined}
                    onClick={sortable ? header.column.getToggleSortingHandler() : undefined}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {sortable && (
                      <span className="sort-arrow">
                        {header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : ''}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
            {filtersOpen && (
              <tr className="filter-row">
                {headerGroup.headers.map((header) => (
                  <th key={`filter-${header.id}`}>
                    <TableColumnFilter column={header.column} />
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} data-label={cell.column.columnDef.header}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
