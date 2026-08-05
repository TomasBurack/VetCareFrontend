import { SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';

export function TableSearchBar({ value, onChange, filtersOpen, onToggleFilters }) {
  const { t } = useLanguage();

  return (
    <div className="table-search-bar">
      <input
        className="search"
        placeholder={t.common.search}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className={`icon-btn${filtersOpen ? ' active' : ''}`}
        title={t.common.columnFilters}
        aria-pressed={filtersOpen}
        aria-label={t.common.columnFilters}
        onClick={onToggleFilters}
      >
        <SlidersHorizontal size={15} />
      </button>
    </div>
  );
}
