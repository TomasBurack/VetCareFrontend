import { useEffect, useState } from 'react';
import { clientApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { EntityTable } from '../../components/EntityTable';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';
import { Field } from '../../components/Field';
import { FormCard } from '../../components/FormCard';
import { Button } from '../../components/Button';
import { useToast } from '../../context/useToast';

const EMPTY_FORM = { firstName: '', lastName: '', dni: '', phoneNumber: '', email: '', password: '' };

export function AdminClients() {
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const data = await clientApi.all();
      setClients(data ?? []);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudieron cargar los clientes.']);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await clientApi.create(form);
      setForm(EMPTY_FORM);
      setCreating(false);
      toast.success('Cliente creado correctamente.');
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo crear el cliente.'];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    try {
      await clientApi.remove(pendingDelete.id);
      setPendingDelete(null);
      toast.success('Cliente eliminado correctamente.');
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo eliminar el cliente.'];
      setErrors(messages);
      toast.error(messages[0]);
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
        <Button onClick={() => setCreating((v) => !v)}>{creating ? 'Cancelar' : '+ Nuevo cliente'}</Button>
      </div>

      {creating ? (
        <FormCard maxWidth={520}>
          <form onSubmit={handleCreate}>
            <div className="grid cols-2">
              <Field label="Nombre" required value={form.firstName} onChange={update('firstName')} />
              <Field label="Apellido" required value={form.lastName} onChange={update('lastName')} />
            </div>
            <div className="grid cols-2">
              <Field label="DNI" required value={form.dni} onChange={update('dni')} />
              <Field label="Teléfono" required value={form.phoneNumber} onChange={update('phoneNumber')} />
            </div>
            <Field label="Email" type="email" required value={form.email} onChange={update('email')} />
            <Field label="Contraseña temporal" type="password" required value={form.password} onChange={update('password')} />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creando…' : 'Crear cliente'}
            </Button>
          </form>
        </FormCard>
      ) : (
        <EntityTable
          rows={filtered}
          columns={[
            { label: 'Nombre', render: (c) => `${c.firstName} ${c.lastName}` },
            { label: 'DNI', render: (c) => c.dni },
            { label: 'Email', render: (c) => c.email },
          ]}
          renderActions={(client) => (
            <button className="icon-btn danger" title="Eliminar" onClick={() => setPendingDelete(client)}>
              ✕
            </button>
          )}
        />
      )}

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
