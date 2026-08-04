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
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const isFormOpen = creating || editingId !== null;

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
      if (editingId !== null) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await clientApi.update(editingId, payload);
        toast.success('Cliente actualizado correctamente.');
      } else {
        await clientApi.create(form);
        toast.success('Cliente creado correctamente.');
      }
      setForm(EMPTY_FORM);
      setCreating(false);
      setEditingId(null);
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo guardar el cliente.'];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(client) {
    setForm({ ...EMPTY_FORM, ...client, password: '' });
    setEditingId(client.id);
    setCreating(false);
  }

  function closeForm() {
    setForm(EMPTY_FORM);
    setCreating(false);
    setEditingId(null);
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
      <h1 className="page-title">{editingId !== null ? 'Editar cliente' : creating ? 'Nuevo cliente' : 'Clientes'}</h1>
      <p className="page-sub">
        {editingId !== null
          ? 'Modifica los datos de la cuenta del cliente.'
          : creating
            ? 'Crea una cuenta de cliente con acceso al panel.'
            : 'Alta, edición y baja de cuentas de clientes.'}
      </p>
      <ErrorBanner messages={errors} />
      <div className="toolbar">
        {!isFormOpen && (
          <input
            className="search"
            placeholder="Buscar por nombre, DNI o email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
        {isFormOpen ? (
          <Button variant="outline" onClick={closeForm}>
            Cancelar
          </Button>
        ) : (
          <Button onClick={() => setCreating(true)}>+ Nuevo cliente</Button>
        )}
      </div>

      {isFormOpen ? (
        <FormCard maxWidth={520}>
          <form onSubmit={handleCreate}>
            <div className="grid cols-2">
              <Field label="Nombre" required placeholder="Agustín" value={form.firstName} onChange={update('firstName')} />
              <Field label="Apellido" required placeholder="Sentis" value={form.lastName} onChange={update('lastName')} />
            </div>
            <div className="grid cols-2">
              <Field label="DNI" required placeholder="43380990" value={form.dni} onChange={update('dni')} />
              <Field
                label="Teléfono"
                required
                placeholder="+54 9 11 2200-1147"
                value={form.phoneNumber}
                onChange={update('phoneNumber')}
              />
            </div>
            <Field label="Email" type="email" required placeholder="agustin.sentis@gmail.com" value={form.email} onChange={update('email')} />
            <Field
              label="Contraseña temporal"
              type="password"
              required={editingId === null}
              placeholder={editingId !== null ? 'Dejar en blanco para no cambiarla' : 'Se le pedirá cambiarla en el primer ingreso'}
              value={form.password}
              onChange={update('password')}
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando…' : editingId !== null ? 'Guardar cambios' : 'Crear cliente'}
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
            <div className="actions">
              <button className="btn-text" onClick={() => startEdit(client)}>
                Modificar
              </button>
              <button className="btn-text danger" onClick={() => setPendingDelete(client)}>
                Eliminar
              </button>
            </div>
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
