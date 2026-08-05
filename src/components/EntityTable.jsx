import { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/useLanguage';

export function EntityTable({ rows, keyField = 'id', columns, renderActions }) {
  const { t } = useLanguage();
  const [sort, setSort] = useState(null);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((col) => col.sortKey === sort.key);
    if (!column) return rows;
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const valueA = column.sortValue ? column.sortValue(a) : column.render(a);
      const valueB = column.sortValue ? column.sortValue(b) : column.render(b);
      return factor * String(valueA ?? '').localeCompare(String(valueB ?? ''), undefined, { sensitivity: 'base' });
    });
  }, [rows, sort, columns]);

  function toggleSort(key) {
    setSort((prev) => {
      if (prev?.key !== key) return { key, direction: 'asc' };
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  }

  return (
    <div className="shifts-table-wrap">
      <table className="shifts-table">
        <thead>
          <tr>
            {columns.map((col) =>
              col.sortKey ? (
                <th key={col.label} className="sortable" onClick={() => toggleSort(col.sortKey)}>
                  {col.label}{' '}
                  <span className="sort-arrow">
                    {sort?.key === col.sortKey ? (sort.direction === 'asc' ? '↑' : '↓') : ''}
                  </span>
                </th>
              ) : (
                <th key={col.label}>{col.label}</th>
              ),
            )}
            {renderActions && <th>{t.common.actions}</th>}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row[keyField]}>
              {columns.map((col) => (
                <td key={col.label} data-label={col.label}>
                  {col.render(row)}
                </td>
              ))}
              {renderActions && <td data-label={t.common.actions}>{renderActions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
