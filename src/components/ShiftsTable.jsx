import { useMemo, useState } from 'react';
import { Badge } from './Badge';
import { TruncatedText } from './TruncatedText';
import { formatShiftDate } from '../utils/date';
import { useLanguage } from '../i18n/useLanguage';

export function ShiftsTable({ shifts, showVeterinarian = false, renderActions }) {
  const [dateSort, setDateSort] = useState('desc');
  const { t } = useLanguage();

  const sortedShifts = useMemo(() => {
    const factor = dateSort === 'asc' ? 1 : -1;
    return [...shifts].sort((a, b) => factor * (new Date(a.dateShift) - new Date(b.dateShift)));
  }, [shifts, dateSort]);

  function toggleDateSort() {
    setDateSort((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }

  return (
    <div className="shifts-table-wrap">
      <table className="shifts-table">
        <thead>
          <tr>
            <th>{t.shifts.pet}</th>
            <th>{t.shifts.reasonShort}</th>
            {showVeterinarian && <th>{t.shifts.veterinarian}</th>}
            <th className="sortable" onClick={toggleDateSort}>
              {t.shifts.date} <span className="sort-arrow">{dateSort === 'asc' ? '↑' : '↓'}</span>
            </th>
            <th>{t.shifts.status}</th>
            {renderActions && <th>{t.common.actions}</th>}
          </tr>
        </thead>
        <tbody>
          {sortedShifts.map((shift) => {
            const status = shift.status?.toLowerCase();
            return (
              <tr key={shift.id}>
                <td data-label={t.shifts.pet}>{shift.petName}</td>
                <td data-label={t.shifts.reasonShort}>
                  <TruncatedText text={shift.description} title={t.shifts.reason} />
                </td>
                {showVeterinarian && <td data-label={t.shifts.veterinarian}>{shift.veterinarianName}</td>}
                <td data-label={t.shifts.date}>{formatShiftDate(shift.dateShift)}</td>
                <td data-label={t.shifts.status}>
                  <Badge status={status} />
                </td>
                {renderActions && <td data-label={t.common.actions}>{renderActions(shift)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
