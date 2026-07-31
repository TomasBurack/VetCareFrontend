import { useEffect, useState } from 'react';
import { shiftApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { ShiftsTable } from '../../components/ShiftsTable';
import { EmptyState } from '../../components/EmptyState';
import { CalendarDays } from 'lucide-react';
import { useToast } from '../../context/useToast';

const STATUS_OPTIONS = ['Served', 'Canceled'];
const STATUS_OPTION_LABELS = {
  Served: 'Marcar como atendido',
  Canceled: 'Cancelar turno',
};

const TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'pendant', label: 'Pendientes' },
  { key: 'served', label: 'Atendidos' },
  { key: 'canceled', label: 'Cancelados' },
];

export function VetShifts() {
  const toast = useToast();
  const [shifts, setShifts] = useState([]);
  const [tab, setTab] = useState('all');
  const [errors, setErrors] = useState([]);

  async function load() {
    try {
      const data = await shiftApi.listVeterinarian();
      setShifts(data ?? []);
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 404)) {
        setErrors(err instanceof ApiError ? err.messages : ['No se pudieron cargar los turnos.']);
      }
      setShifts([]);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount, no client-side data source to derive from
    load();
  }, []);

  async function changeStatus(id, status) {
    try {
      await shiftApi.updateStatusAsVeterinarian(id, status);
      toast.success(status === 'Served' ? 'Turno marcado como atendido.' : 'Turno cancelado correctamente.');
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo actualizar el turno.'];
      setErrors(messages);
      toast.error(messages[0]);
    }
  }

  const today = shifts.filter((s) => s.dateShift?.startsWith(new Date().toISOString().slice(0, 10))).length;
  const pending = shifts.filter((s) => s.status?.toLowerCase() === 'pendant').length;

  const filtered = shifts.filter((s) => tab === 'all' || s.status?.toLowerCase() === tab);

  return (
    <>
      <h1 className="page-title">Turnos asignados</h1>
      <p className="page-sub">Consultas agendadas bajo tu matrícula.</p>
      <ErrorBanner messages={errors} />

      <div className="stat-row">
        <div className="stat">
          <div className="n">{today}</div>
          <div className="l">Hoy</div>
        </div>
        <div className="stat">
          <div className="n">{pending}</div>
          <div className="l">Pendientes de confirmar</div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {shifts.length === 0 && <EmptyState icon={<CalendarDays size={28} />} message="No tenés turnos asignados" />}

      {shifts.length > 0 && (
        <ShiftsTable
          shifts={filtered}
          renderActions={(shift) =>
            shift.status?.toLowerCase() === 'pendant' && (
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
            )
          }
        />
      )}
    </>
  );
}
