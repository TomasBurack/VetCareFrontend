import { useEffect, useState } from 'react';
import { clientApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { EntityRow } from '../../components/EntityRow';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';

export function AdminClients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);

  async function load() {
    try {
      const data = await clientApi.all();
      setClients(data ?? []);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudieron cargar los clientes.']);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount, no client-side data source to derive from
    load();
  }, []);

  async function confirmDelete() {
    try {
      await clientApi.remove(pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudo eliminar el cliente.']);
      setPendingDelete(null);
    }
  }

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.dni?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <h1 className="page-title">Clientes</h1>
      <p className="page-sub">Alta, edición y baja de cuentas de clientes.</p>
      <ErrorBanner messages={errors} />
      <div className="toolbar">
        <input
          className="search"
          placeholder="Buscar por nombre, DNI o email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.map((client) => (
        <EntityRow
          key={client.id}
          name={`${client.firstName} ${client.lastName}`}
          subtitle={`DNI ${client.dni} · ${client.email}`}
          onDelete={() => setPendingDelete(client)}
        />
      ))}

      {pendingDelete && (
        <ConfirmDeleteOverlay
          title={`Eliminar a ${pendingDelete.firstName} ${pendingDelete.lastName}`}
          description="Esta acción elimina la cuenta, sus mascotas y su historial de turnos. No se puede deshacer."
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
