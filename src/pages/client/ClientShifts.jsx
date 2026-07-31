import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { shiftApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { TruncatedText } from '../../components/TruncatedText';
import { formatShiftDate } from '../../utils/date';
import { useToast } from '../../context/useToast';

const STATUS_STRIPE = {
  pendant: 'var(--amber)',
  served: 'var(--primary)',
  canceled: 'var(--terracotta)',
};

export function ClientShifts() {
  const toast = useToast();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  async function load() {
    setLoading(true);
    try {
      const data = await shiftApi.listClient();
      setShifts(data ?? []);
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 404)) {
        setErrors(err instanceof ApiError ? err.messages : ['No se pudieron cargar los turnos.']);
      }
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function cancelShift(id) {
    try {
      await shiftApi.cancelAsClient(id);
      toast.success('Turno cancelado correctamente.');
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo cancelar el turno.'];
      setErrors(messages);
      toast.error(messages[0]);
    }
  }

  return (
    <>
      <h1 className="page-title">Mis turnos</h1>
      <p className="page-sub">Turnos solicitados para tus mascotas.</p>
      <ErrorBanner messages={errors} />
      <div className="toolbar">
        <div />
        <Link to="/mis-turnos/nuevo">
          <Button>+ Solicitar turno</Button>
        </Link>
      </div>

      {!loading && shifts.length === 0 && (
        <EmptyState icon={<CalendarDays size={28} />} message="No tenés turnos solicitados" />
      )}

      {shifts.map((shift) => {
        const status = shift.status?.toLowerCase();
        return (
          <div className="ficha" style={{ '--stripe': STATUS_STRIPE[status], marginBottom: '.8rem' }} key={shift.id}>
            <div className="ficha-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '.95rem' }}>{shift.petName}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--sage-muted)', marginTop: '.2rem' }}>
                  <TruncatedText text={shift.description} title="Motivo de la consulta" limit={30} /> ·{' '}
                  {formatShiftDate(shift.dateShift)} · {shift.veterinarianName}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                <Badge status={status} />
                {status === 'pendant' && (
                  <Button variant="outline" style={{ padding: '.4rem .8rem', fontSize: '.78rem' }} onClick={() => cancelShift(shift.id)}>
                    Cancelar turno
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
