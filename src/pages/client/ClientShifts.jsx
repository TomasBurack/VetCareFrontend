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
import { useLanguage } from '../../i18n/useLanguage';

const STATUS_STRIPE = {
  pendant: 'var(--amber)',
  served: 'var(--primary)',
  canceled: 'var(--terracotta)',
};

export function ClientShifts() {
  const toast = useToast();
  const { t } = useLanguage();
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
        setErrors(err instanceof ApiError ? err.messages : [t.clientShifts.loadError]);
      }
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch on mount only; `load` closes over `t` but must not re-run on language change
  }, []);

  async function cancelShift(id) {
    try {
      await shiftApi.cancelAsClient(id);
      toast.success(t.clientShifts.canceled);
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.clientShifts.cancelError];
      setErrors(messages);
      toast.error(messages[0]);
    }
  }

  return (
    <>
      <h1 className="page-title">{t.clientShifts.title}</h1>
      <p className="page-sub">{t.clientShifts.subtitle}</p>
      <ErrorBanner messages={errors} />
      <div className="toolbar">
        <div />
        <Link to="/mis-turnos/nuevo">
          <Button>{t.clientShifts.new}</Button>
        </Link>
      </div>

      {!loading && shifts.length === 0 && (
        <EmptyState icon={<CalendarDays size={28} />} message={t.clientShifts.emptyTitle} />
      )}

      {shifts.map((shift) => {
        const status = shift.status?.toLowerCase();
        return (
          <div className="ficha" style={{ '--stripe': STATUS_STRIPE[status], marginBottom: '.8rem' }} key={shift.id}>
            <div className="ficha-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '.95rem' }}>{shift.petName}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.2rem', marginTop: '.4rem', fontSize: '.8rem' }}>
                  <div>
                    <strong>{t.shifts.reasonShort}:</strong>{' '}
                    <span style={{ color: 'var(--sage-muted)' }}>
                      <TruncatedText text={shift.description} title={t.shifts.reason} limit={30} />
                    </span>
                  </div>
                  <div>
                    <strong>{t.shifts.date}:</strong>{' '}
                    <span style={{ color: 'var(--sage-muted)' }}>{formatShiftDate(shift.dateShift)}</span>
                  </div>
                  <div>
                    <strong>{t.shifts.veterinarian}:</strong>{' '}
                    <span style={{ color: 'var(--sage-muted)' }}>{shift.veterinarianName}</span>
                  </div>
                  {shift.observations && (
                    <div>
                      <strong>{t.shifts.observationsShort}:</strong>{' '}
                      <TruncatedText text={shift.observations} title={t.shifts.observations} limit={60} />
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                <Badge status={status} />
                {status === 'pendant' && (
                  <Button variant="outline" style={{ padding: '.4rem .8rem', fontSize: '.78rem' }} onClick={() => cancelShift(shift.id)}>
                    {t.shifts.cancelShift}
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
