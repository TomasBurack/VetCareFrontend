import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { veterinarianApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { EntityRow } from '../../components/EntityRow';
import { Button } from '../../components/Button';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';

export function AdminVets() {
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
      load();
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudo eliminar el veterinario.']);
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

      {filtered.map((vet) => (
        <EntityRow
          key={vet.id}
          name={`${vet.firstName} ${vet.lastName}`}
          subtitle={`${vet.enrollment} · ${vet.speciality}`}
          onDelete={() => setPendingDelete(vet)}
        />
      ))}

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
