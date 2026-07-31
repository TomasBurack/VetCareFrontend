import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { veterinarianApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { EntityTable } from '../../components/EntityTable';
import { Button } from '../../components/Button';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';
import { useToast } from '../../context/useToast';

export function AdminVets() {
  const toast = useToast();
  const [vets, setVets] = useState([]);
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);

  async function load() {
    try {
      const data = await veterinarianApi.all();
      setVets(data ?? []);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudieron cargar los veterinarios.']);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount, no client-side data source to derive from
    load();
  }, []);

  async function confirmDelete() {
    try {
      await veterinarianApi.remove(pendingDelete.id);
      setPendingDelete(null);
      toast.success('Veterinario eliminado correctamente.');
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo eliminar el veterinario.'];
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
      <h1 className="page-title">Veterinarios</h1>
      <p className="page-sub">Alta, edición y baja del staff veterinario.</p>
      <ErrorBanner messages={errors} />
      <div className="toolbar">
        <input
          className="search"
          placeholder="Buscar por nombre o matrícula…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link to="/veterinarios/nuevo">
          <Button>+ Nuevo veterinario</Button>
        </Link>
      </div>

      <EntityTable
        rows={filtered}
        columns={[
          { label: 'Nombre', render: (v) => `${v.firstName} ${v.lastName}` },
          { label: 'Matrícula', render: (v) => v.enrollment },
          { label: 'Especialidad', render: (v) => v.speciality },
        ]}
        renderActions={(vet) => (
          <button className="icon-btn danger" title="Eliminar" onClick={() => setPendingDelete(vet)}>
            ✕
          </button>
        )}
      />

      {pendingDelete && (
        <ConfirmDeleteOverlay
          title={`Eliminar a ${pendingDelete.firstName} ${pendingDelete.lastName}`}
          description="Esta acción elimina la cuenta del veterinario. No se puede deshacer."
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
