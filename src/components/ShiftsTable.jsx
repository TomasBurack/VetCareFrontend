import { useMemo, useState } from 'react';
import { Badge } from './Badge';
import { TruncatedText } from './TruncatedText';
import { formatShiftDate } from '../utils/date';

export function ShiftsTable({ shifts, showVeterinarian = false, renderActions }) {
  const [dateSort, setDateSort] = useState('desc');

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
            <th>Mascota</th>
            <th>Motivo</th>
            {showVeterinarian && <th>Veterinario</th>}
            <th className="sortable" onClick={toggleDateSort}>
              Fecha <span className="sort-arrow">{dateSort === 'asc' ? '↑' : '↓'}</span>
            </th>
            <th>Estado</th>
            {renderActions && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {sortedShifts.map((shift) => {
            const status = shift.status?.toLowerCase();
            return (
              <tr key={shift.id}>
                <td data-label="Mascota">{shift.petName}</td>
                <td data-label="Motivo">
                  <TruncatedText text={shift.description} title="Motivo de la consulta" />
                </td>
                {showVeterinarian && <td data-label="Veterinario">{shift.veterinarianName}</td>}
                <td data-label="Fecha">{formatShiftDate(shift.dateShift)}</td>
                <td data-label="Estado">
                  <Badge status={status} />
                </td>
                {renderActions && <td data-label="Acciones">{renderActions(shift)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
