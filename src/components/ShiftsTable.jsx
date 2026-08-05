import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Badge } from './Badge';
import { TruncatedText } from './TruncatedText';
import { TableColumnFilter } from './TableColumnFilter';
import { TableSearchBar } from './TableSearchBar';
import { formatShiftDate } from '../utils/date';
import { useLanguage } from '../i18n/useLanguage';

const STATUS_KEYS = ['pendant', 'served', 'canceled'];

export function ShiftsTable({ shifts, showVeterinarian = false, renderActions, renderObservations }) {
  const { t } = useLanguage();
  const [sorting, setSorting] = useState([{ id: 'date', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const columns = useMemo(() => {
    const cols = [
      {
        id: 'pet',
        header: t.shifts.pet,
        accessorFn: (shift) => shift.petName ?? '',
        enableSorting: false,
        cell: ({ getValue }) => getValue(),
      },
      {
        id: 'reason',
        header: t.shifts.reasonShort,
        accessorFn: (shift) => shift.description ?? '',
        enableSorting: false,
        cell: ({ getValue }) => <TruncatedText text={getValue()} title={t.shifts.reason} />,
      },
    ];

    if (showVeterinarian) {
      cols.push({
        id: 'veterinarian',
        header: t.shifts.veterinarian,
        accessorFn: (shift) => shift.veterinarianName ?? '',
        enableSorting: false,
        cell: ({ getValue }) => getValue(),
      });
    }

    cols.push(
      {
        id: 'date',
        header: t.shifts.date,
        accessorFn: (shift) => shift.dateShift,
        sortingFn: (a, b) => new Date(a.getValue('date')) - new Date(b.getValue('date')),
        filterFn: (row, columnId, filterValue) =>
          formatShiftDate(row.getValue(columnId)).toLowerCase().includes(String(filterValue).toLowerCase()),
        cell: ({ getValue }) => formatShiftDate(getValue()),
      },
      {
        id: 'status',
        header: t.shifts.status,
        accessorFn: (shift) => t.shifts.statuses[shift.status?.toLowerCase()] ?? shift.status,
        enableSorting: false,
        filterFn: 'equals',
        meta: {
          filterVariant: 'select',
          filterOptions: STATUS_KEYS.map((key) => ({ value: t.shifts.statuses[key], label: t.shifts.statuses[key] })),
        },
        cell: ({ row }) => <Badge status={row.original.status?.toLowerCase()} />,
      },
      {
        id: 'observations',
        header: t.shifts.observationsShort,
        accessorFn: (shift) => shift.observations ?? '',
        enableSorting: false,
        cell: ({ row }) => {
          const shift = row.original;
          if (renderObservations) return renderObservations(shift);
          if (shift.observations) {
            return <TruncatedText text={shift.observations} title={t.shifts.observations} />;
          }
          return <span style={{ color: 'var(--sage-muted)' }}>{t.shifts.noObservations}</span>;
        },
      },
    );

    if (renderActions) {
      cols.push({
        id: 'actions',
        header: t.common.actions,
        enableSorting: false,
        enableGlobalFilter: false,
        enableColumnFilter: false,
        cell: ({ row }) => renderActions(row.original),
      });
    }

    return cols;
  }, [t, showVeterinarian, renderActions, renderObservations]);

  const table = useReactTable({
    data: shifts,
    columns,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowId: (shift) => shift.id,
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
