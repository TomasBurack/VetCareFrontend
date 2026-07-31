export function EntityTable({ rows, keyField = 'id', columns, renderActions }) {
  return (
    <div className="shifts-table-wrap">
      <table className="shifts-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.label}>{col.label}</th>
            ))}
            {renderActions && <th>Acciones</th>}
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
              {renderActions && <td data-label="Acciones">{renderActions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
