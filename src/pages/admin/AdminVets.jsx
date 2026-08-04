import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { veterinarianApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { EntityTable } from '../../components/EntityTable';
import { Button } from '../../components/Button';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';
import { useToast } from '../../context/useToast';
import { useLanguage } from '../../i18n/useLanguage';

export function AdminVets() {
  const toast = useToast();
  const { t } = useLanguage();
  const [vets, setVets] = useState([]);
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);

  async function load() {
    try {
      const data = await veterinarianApi.all();
      setVets(data ?? []);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : [t.adminVets.loadError]);
    }
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch on mount only; `load` closes over `t` but must not re-run on language change
  }, []);

  async function confirmDelete() {
    try {
      await veterinarianApi.remove(pendingDelete.id);
      setPendingDelete(null);
      toast.success(t.adminVets.deleted);
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.adminVets.deleteError];
      setErrors(messages);
      toast.error(messages[0]);
      setPendingDelete(null);
    }
  }

  const filtered = vets.filter((v) => {
    const q = search.toLowerCase();
    return `${v.firstName} ${v.lastName}`.toLowerCase().includes(q) || v.enrollment?.toLowerCase().includes(q);
  });

  return (
    <>
      <h1 className="page-title">{t.adminVets.title}</h1>
      <p className="page-sub">{t.adminVets.subtitle}</p>
      <ErrorBanner messages={errors} />
      <div className="toolbar">
        <input
          className="search"
          placeholder={t.adminVets.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link to="/veterinarios/nuevo">
          <Button>{t.adminVets.new}</Button>
        </Link>
      </div>

      <EntityTable
        rows={filtered}
        columns={[
          { label: t.common.name, render: (v) => `${v.firstName} ${v.lastName}` },
          { label: t.adminVets.enrollment, render: (v) => v.enrollment },
          { label: t.adminVets.speciality, render: (v) => t.specialities[v.speciality] ?? v.speciality },
        ]}
        renderActions={(vet) => (
          <div className="actions">
            <Link className="btn-text" to={`/veterinarios/editar/${vet.id}`}>
              {t.common.edit}
            </Link>
            <button className="btn-text danger" onClick={() => setPendingDelete(vet)}>
              {t.common.delete}
            </button>
          </div>
        )}
      />

      {pendingDelete && (
        <ConfirmDeleteOverlay
          title={t.adminVets.deleteTitle(`${pendingDelete.firstName} ${pendingDelete.lastName}`)}
          description={t.adminVets.deleteDescription}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
