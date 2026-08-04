import { useEffect, useState } from 'react';
import { sysadminApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { EntityTable } from '../../components/EntityTable';
import { Button } from '../../components/Button';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';
import { Field } from '../../components/Field';
import { FormCard } from '../../components/FormCard';
import { useToast } from '../../context/useToast';

const EMPTY_FORM = { firstName: '', lastName: '', dni: '', phoneNumber: '', email: '', password: '' };

export function SysadminAdmins() {
  const toast = useToast();
  const [admins, setAdmins] = useState([]);
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
      const data = await sysadminApi.allAdmins();
      setAdmins(data ?? []);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudieron cargar los administradores.']);
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
        await sysadminApi.update(editingId, payload);
        toast.success('Administrador actualizado correctamente.');
      } else {
        await sysadminApi.create(form);
        toast.success('Administrador creado correctamente.');
      }
      setForm(EMPTY_FORM);
      setCreating(false);
      setEditingId(null);
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo guardar el administrador.'];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(admin) {
    setForm({ ...EMPTY_FORM, ...admin, password: '' });
    setEditingId(admin.id);
    setCreating(false);
  }

  function closeForm() {
    setForm(EMPTY_FORM);
    setCreating(false);
    setEditingId(null);
  }

  async function confirmDelete() {
    try {
      await sysadminApi.remove(pendingDelete.id);
      setPendingDelete(null);
      toast.success('Administrador eliminado correctamente.');
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo eliminar el administrador.'];
      setErrors(messages);
      toast.error(messages[0]);
      setPendingDelete(null);
    }
  }

  const filtered = admins.filter((a) => {
    const q = search.toLowerCase();
    return `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
  });

  return (
    <>
      <h1 className="page-title">{editingId !== null ? 'Editar administrador' : creating ? 'Nuevo administrador' : 'Administradores'}</h1>
      <p className="page-sub">
        {editingId !== null
          ? 'Modifica los datos de la cuenta del administrador.'
          : creating
            ? 'Crea una cuenta de administrador con acceso al panel.'
            : 'Alta, edición y baja de cuentas de administrador.'}
      </p>
      <ErrorBanner messages={errors} />
      <div className="toolbar">
        {!isFormOpen && (
          <input
            className="search"
            placeholder="Buscar por nombre o email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
        {isFormOpen ? (
          <Button variant="outline" onClick={closeForm}>
            Cancelar
          </Button>
        ) : (
          <Button onClick={() => setCreating(true)}>+ Nuevo administrador</Button>
        )}
      </div>

      {isFormOpen ? (
        <FormCard maxWidth={520}>
          <form onSubmit={handleCreate}>
            <div className="grid cols-2">
              <Field label="Nombre" required placeholder="Tomás" value={form.firstName} onChange={update('firstName')} />
              <Field label="Apellido" required placeholder="Burack" value={form.lastName} onChange={update('lastName')} />
            </div>
            <div className="grid cols-2">
              <Field label="DNI" required placeholder="46760480" value={form.dni} onChange={update('dni')} />
              <Field
                label="Teléfono"
                required
                placeholder="+54 9 11 2200-1147"
                value={form.phoneNumber}
                onChange={update('phoneNumber')}
              />
            </div>
            <Field label="Email" type="email" required placeholder="tomas.burack@vetcare.com" value={form.email} onChange={update('email')} />
            <Field
              label="Contraseña temporal"
              type="password"
              required={editingId === null}
              placeholder={editingId !== null ? 'Dejar en blanco para no cambiarla' : 'Se le pedirá cambiarla en el primer ingreso'}
              value={form.password}
              onChange={update('password')}
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando…' : editingId !== null ? 'Guardar cambios' : 'Crear administrador'}
            </Button>
          </form>
        </FormCard>
      ) : (
        <EntityTable
          rows={filtered}
          columns={[
            { label: 'Nombre', render: (a) => `${a.firstName} ${a.lastName}` },
            { label: 'DNI', render: (a) => a.dni },
            { label: 'Email', render: (a) => a.email },
          ]}
          renderActions={(admin) => (
            <div className="actions">
              <button className="btn-text" onClick={() => startEdit(admin)}>
                Modificar
              </button>
              <button className="btn-text danger" onClick={() => setPendingDelete(admin)}>
                Eliminar
              </button>
            </div>
          )}
        />
      )}

      {pendingDelete && (
        <ConfirmDeleteOverlay
          title={`Eliminar a ${pendingDelete.firstName} ${pendingDelete.lastName}`}
          description="Esta acción elimina la cuenta del administrador. No se puede deshacer."
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
