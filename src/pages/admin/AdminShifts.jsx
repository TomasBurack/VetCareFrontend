import { useEffect, useState } from 'react';
import { shiftApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { ShiftsTable } from '../../components/ShiftsTable';
import { useLanguage } from '../../i18n/useLanguage';

function ViewObservationsOverlay({ observations, onClose, title, closeLabel }) {
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="modal-mock" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="t">{title}</span>
        </div>
        <div className="modal-body" style={{ color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
          {observations}
        </div>
        <div className="modal-foot">
          <button className="btn btn-outline" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const TAB_KEYS = ['all', 'pendant', 'served', 'canceled'];

export function AdminShifts() {
  const { t } = useLanguage();
  const [shifts, setShifts] = useState([]);
  const [tab, setTab] = useState('all');
  const [errors, setErrors] = useState([]);
  const [viewingObservations, setViewingObservations] = useState(null);

  async function load() {
    try {
      const data = await shiftApi.listAdmin();
      setShifts(data ?? []);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : [t.adminShifts.loadError]);
    }
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch on mount only; `load` closes over `t` but must not re-run on language change
  }, []);

  const filtered = tab === 'all' ? shifts : shifts.filter((s) => s.status?.toLowerCase() === tab);

  return (
    <>
      <h1 className="page-title">{t.adminShifts.title}</h1>
      <p className="page-sub">{t.adminShifts.subtitle}</p>
      <ErrorBanner messages={errors} />

      <div className="toolbar">
        <div className="tabs" style={{ border: 'none', margin: 0 }}>
          {TAB_KEYS.map((key) => (
            <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
              {t.adminShifts.tabs[key]}
            </button>
          ))}
        </div>
      </div>

      <ShiftsTable
        shifts={filtered}
        showVeterinarian
        renderObservations={(shift) =>
          shift.observations ? (
            <button className="btn-text" onClick={() => setViewingObservations(shift)}>
              {t.adminShifts.viewObservations}
            </button>
          ) : (
            <span style={{ color: 'var(--sage-muted)' }}>{t.shifts.noObservations}</span>
          )
        }
      />

      {viewingObservations && (
        <ViewObservationsOverlay
          title={t.shifts.observations}
          observations={viewingObservations.observations}
          onClose={() => setViewingObservations(null)}
          closeLabel={t.common.close}
        />
      )}
    </>
  );
}
