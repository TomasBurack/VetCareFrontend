import { useEffect, useState } from 'react';
import { shiftApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { CalendarDays } from 'lucide-react';

const STATUS_STRIPE = {
  pendant: 'var(--amber)',
  served: 'var(--primary)',
  canceled: 'var(--terracotta)',
};

const STATUS_OPTIONS = ['Served', 'Canceled'];
const STATUS_OPTION_LABELS = {
  Served: 'Marcar como atendido',
  Canceled: 'Cancelar turno',
};

export function VetShifts() {
  const [shifts, setShifts] = useState([]);
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
      load();
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudo actualizar el turno.']);
    }
  }

  const today = shifts.filter((s) => s.dateShift?.startsWith(new Date().toISOString().slice(0, 10))).length;
  const pending = shifts.filter((s) => s.status?.toLowerCase() === 'pendant').length;

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
          <div className="n">{shifts.length}</div>
          <div className="l">Total</div>
        </div>
        <div className="stat">
          <div className="n">{pending}</div>
          <div className="l">Pendientes de confirmar</div>
        </div>
      </div>

      {shifts.length === 0 && <EmptyState icon={<CalendarDays size={28} />} message="No tenés turnos asignados" />}

      {shifts.map((shift) => {
        const status = shift.status?.toLowerCase();
        return (
          <div className="ficha" style={{ '--stripe': STATUS_STRIPE[status], marginBottom: '.8rem' }} key={shift.id}>
            <div className="ficha-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '.95rem' }}>{shift.petName}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--sage-muted)', marginTop: '.2rem' }}>
                  {shift.description} · {shift.dateShift}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                <Badge status={status} />
                {status === 'pendant' && (
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
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
