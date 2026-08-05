import { useLanguage } from '../i18n/useLanguage';

export function TableColumnFilter({ column }) {
  const { t } = useLanguage();

  if (!column.getCanFilter()) return null;

  const meta = column.columnDef.meta ?? {};
  const value = column.getFilterValue() ?? '';

  if (meta.filterVariant === 'select') {
    return (
      <select
        className="col-filter"
        value={value}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      >
        <option value="">{t.common.all}</option>
        {meta.filterOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      className="col-filter"
      value={value}
      placeholder={t.common.search}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
    />
  );
}
