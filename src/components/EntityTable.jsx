import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useLanguage } from '../i18n/useLanguage';

export function EntityTable({ rows, keyField = 'id', columns, renderActions }) {
  const { t } = useLanguage();
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

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
        cell: ({ row }) => renderActions(row.original),
      });
    }

    return defs;
  }, [columns, renderActions, t]);

  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getRowId: (row) => row[keyField],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="shifts-table-wrap">
      <div className="table-search-bar">
        <input
          className="search"
          placeholder={t.common.search}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>
      <div className="table-scroll">
        <table className="shifts-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
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
            ))}
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
