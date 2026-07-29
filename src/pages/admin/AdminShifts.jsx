import { useEffect, useState } from 'react';
import { shiftApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { ShiftsTable } from '../../components/ShiftsTable';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';
import { useToast } from '../../context/useToast';

const TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'pendant', label: 'Pendientes' },
  { key: 'served', label: 'Atendidos' },
  { key: 'canceled', label: 'Cancelados' },
];

const STATUS_OPTIONS = ['Served', 'Canceled'];
const STATUS_OPTION_LABELS = {
  Served: 'Marcar como atendido',
  Canceled: 'Cancelar turno',
};

export function AdminShifts() {
  const toast = useToast();
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

  async function changeStatus(id, status) {
    try {
      await shiftApi.updateStatusAsAdmin(id, status);
      toast.success(status === 'Served' ? 'Turno marcado como atendido.' : 'Turno cancelado correctamente.');
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo actualizar el turno.'];
      setErrors(messages);
      toast.error(messages[0]);
    }
  }

  async function confirmDelete() {
    try {
      await shiftApi.removeAsAdmin(pendingDelete.id);
      setPendingDelete(null);
      toast.success('Turno eliminado correctamente.');
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo eliminar el turno.'];
      setErrors(messages);
      toast.error(messages[0]);
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

      <ShiftsTable
        shifts={filtered}
        showVeterinarian
        renderActions={(shift) =>
          shift.status?.toLowerCase() === 'pendant' && (
            <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
              <select
                className="f"
                style={{ width: 'auto', margin: 0, padding: '.4rem .6rem', fontSize: '.78rem' }}
                value=""
                onChange={(e) => e.target.value && changeStatus(shift.id, e.target.value)}
              >
                <option value="">Cambiar estado…</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {STATUS_OPTION_LABELS[option]}
                  </option>
                ))}
              </select>
              <button className="icon-btn danger" title="Eliminar" onClick={() => setPendingDelete(shift)}>
                ✕
              </button>
            </div>
          )
        }
      />

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
