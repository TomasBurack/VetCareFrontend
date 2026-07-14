import { useEffect, useState } from 'react';
import { shiftApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Badge } from '../../components/Badge';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';
import { formatShiftDate } from '../../utils/date';

const STATUS_STRIPE = {
  pendant: 'var(--amber)',
  served: 'var(--primary)',
  canceled: 'var(--terracotta)',
};

const TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'pendant', label: 'Pendientes' },
  { key: 'served', label: 'Atendidos' },
  { key: 'canceled', label: 'Cancelados' },
];

export function AdminShifts() {
  const [shifts, setShifts] = useState([]);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);

  async function load() {
    try {
      const data = await shiftApi.listAdmin();
      setShifts(data ?? []);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudieron cargar los turnos.']);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount, no client-side data source to derive from
    load();
  }, []);

  async function confirmDelete() {
    try {
      await shiftApi.removeAsAdmin(pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudo eliminar el turno.']);
      setPendingDelete(null);
    }
  }

  const filtered = shifts.filter((s) => {
    const status = s.status?.toLowerCase();
    if (tab !== 'all' && status !== tab) return false;
    const q = search.toLowerCase();
    return !q || s.petName?.toLowerCase().includes(q) || s.veterinarianName?.toLowerCase().includes(q);
  });

  return (
    <>
      <h1 className="page-title">Turnos (global)</h1>
      <p className="page-sub">Todos los turnos del sistema, con opción de eliminar.</p>
      <ErrorBanner messages={errors} />

      <div className="toolbar">
        <div className="tabs" style={{ border: 'none', margin: 0 }}>
          {TABS.map((t) => (
            <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <input
          className="search"
          placeholder="Buscar por mascota o veterinario…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.map((shift) => {
        const status = shift.status?.toLowerCase();
        return (
          <div className="ficha" style={{ '--stripe': STATUS_STRIPE[status], marginBottom: '.8rem' }} key={shift.id}>
            <div className="ficha-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '.95rem' }}>{shift.petName}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--sage-muted)', marginTop: '.2rem' }}>
                  {shift.veterinarianName} · {formatShiftDate(shift.dateShift)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                <Badge status={status} />
                {status === 'pendant' && (
                  <button className="icon-btn danger" title="Eliminar" onClick={() => setPendingDelete(shift)}>
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {pendingDelete && (
        <ConfirmDeleteOverlay
          title="Eliminar turno"
          description="Esta acción elimina el turno del sistema. No se puede deshacer."
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
