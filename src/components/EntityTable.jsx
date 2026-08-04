import { useLanguage } from '../i18n/useLanguage';

export function EntityTable({ rows, keyField = 'id', columns, renderActions }) {
  const { t } = useLanguage();

  return (
    <div className="shifts-table-wrap">
      <table className="shifts-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.label}>{col.label}</th>
            ))}
            {renderActions && <th>{t.common.actions}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
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
