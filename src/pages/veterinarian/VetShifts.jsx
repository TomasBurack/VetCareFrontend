import { useEffect, useState } from 'react';
import { shiftApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { ShiftsTable } from '../../components/ShiftsTable';
import { EmptyState } from '../../components/EmptyState';
import { ShiftObservationsOverlay } from '../../components/ShiftObservationsOverlay';
import { CalendarDays } from 'lucide-react';
import { useToast } from '../../context/useToast';
import { useLanguage } from '../../i18n/useLanguage';

const STATUS_OPTIONS = ['Served', 'Canceled'];
const TAB_KEYS = ['all', 'pendant', 'served', 'canceled'];

export function VetShifts() {
  const toast = useToast();
  const { t } = useLanguage();
  const [shifts, setShifts] = useState([]);
  const [tab, setTab] = useState('all');
  const [errors, setErrors] = useState([]);
  const [editingObservations, setEditingObservations] = useState(null);
  const [observationsSubmitting, setObservationsSubmitting] = useState(false);
  const [observationsError, setObservationsError] = useState(null);

  async function load() {
    try {
      const data = await shiftApi.listVeterinarian();
      setShifts(data ?? []);
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 404)) {
        setErrors(err instanceof ApiError ? err.messages : [t.vetShifts.loadError]);
      }
      setShifts([]);
    }
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch on mount only; `load` closes over `t` but must not re-run on language change
  }, []);

  async function changeStatus(id, status) {
    try {
      await shiftApi.updateStatusAsVeterinarian(id, status);
      toast.success(status === 'Served' ? t.vetShifts.markedServed : t.vetShifts.canceled);
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.vetShifts.updateError];
      setErrors(messages);
      toast.error(messages[0]);
    }
  }

  async function saveObservations(observations) {
    setObservationsSubmitting(true);
    setObservationsError(null);
    try {
      await shiftApi.updateObservationsAsVeterinarian(editingObservations.id, observations);
      toast.success(t.vetShifts.observationsSaved);
      setEditingObservations(null);
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.vetShifts.observationsError];
      setObservationsError(messages[0]);
      toast.error(messages[0]);
    } finally {
      setObservationsSubmitting(false);
    }
  }

  const today = shifts.filter((s) => s.dateShift?.startsWith(new Date().toISOString().slice(0, 10))).length;
  const pending = shifts.filter((s) => s.status?.toLowerCase() === 'pendant').length;

  const filtered = shifts.filter((s) => tab === 'all' || s.status?.toLowerCase() === tab);

  return (
    <>
      <h1 className="page-title">{t.vetShifts.title}</h1>
      <p className="page-sub">{t.vetShifts.subtitle}</p>
      <ErrorBanner messages={errors} />

      <div className="stat-row">
        <div className="stat">
          <div className="n">{today}</div>
          <div className="l">{t.vetShifts.statToday}</div>
        </div>
        <div className="stat">
          <div className="n">{pending}</div>
          <div className="l">{t.vetShifts.statPending}</div>
        </div>
      </div>

      <div className="tabs">
        {TAB_KEYS.map((key) => (
          <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
            {t.vetShifts.tabs[key]}
          </button>
        ))}
      </div>

      {shifts.length === 0 && (
        <EmptyState icon={<CalendarDays size={28} />} message={t.vetShifts.emptyTitle} />
      )}

      {shifts.length > 0 && (
        <ShiftsTable
          shifts={filtered}
          renderActions={(shift) => (
            <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {shift.status?.toLowerCase() === 'pendant' && (
                <select
                  className="f"
                  style={{ width: 'auto', margin: 0, padding: '.4rem .6rem', fontSize: '.78rem' }}
                  value=""
                  onChange={(e) => e.target.value && changeStatus(shift.id, e.target.value)}
                >
                  <option value="">{t.vetShifts.changeStatus}</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === 'Served' ? t.shifts.markServed : t.shifts.cancelShift}
                    </option>
                  ))}
                </select>
              )}
              <button
                className="btn-text"
                onClick={() => {
                  setObservationsError(null);
                  setEditingObservations(shift);
                }}
              >
                {shift.observations ? t.vetShifts.editObservations : t.vetShifts.addObservations}
              </button>
            </div>
          )}
        />
      )}

      {editingObservations && (
        <ShiftObservationsOverlay
          initialValue={editingObservations.observations ?? ''}
          submitting={observationsSubmitting}
          error={observationsError}
          onCancel={() => setEditingObservations(null)}
          onSave={saveObservations}
        />
      )}
    </>
  );
}
