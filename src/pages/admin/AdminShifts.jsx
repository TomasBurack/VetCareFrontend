import { useEffect, useState } from 'react';
import { shiftApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { ShiftsTable } from '../../components/ShiftsTable';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';
import { useToast } from '../../context/useToast';
import { useLanguage } from '../../i18n/useLanguage';

const TAB_KEYS = ['all', 'pendant', 'served', 'canceled'];

const STATUS_OPTIONS = ['Served', 'Canceled'];

export function AdminShifts() {
  const toast = useToast();
  const { t } = useLanguage();
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
      setErrors(err instanceof ApiError ? err.messages : [t.adminShifts.loadError]);
    }
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch on mount only; `load` closes over `t` but must not re-run on language change
  }, []);

  async function changeStatus(id, status) {
    try {
      await shiftApi.updateStatusAsAdmin(id, status);
      toast.success(status === 'Served' ? t.adminShifts.markedServed : t.adminShifts.canceled);
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.adminShifts.updateError];
      setErrors(messages);
      toast.error(messages[0]);
    }
  }

  async function confirmDelete() {
    try {
      await shiftApi.removeAsAdmin(pendingDelete.id);
      setPendingDelete(null);
      toast.success(t.adminShifts.deleted);
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.adminShifts.deleteError];
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
        <input
          className="search"
          placeholder={t.adminShifts.searchPlaceholder}
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
                <option value="">{t.adminShifts.changeStatus}</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === 'Served' ? t.shifts.markServed : t.shifts.cancelShift}
                  </option>
                ))}
              </select>
              <button className="btn-text danger" onClick={() => setPendingDelete(shift)}>
                {t.common.delete}
              </button>
            </div>
          )
        }
      />

      {pendingDelete && (
        <ConfirmDeleteOverlay
          title={t.adminShifts.deleteTitle}
          description={t.adminShifts.deleteDescription}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
