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
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

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
      await sysadminApi.create(form);
      setForm(EMPTY_FORM);
      setCreating(false);
      toast.success('Administrador creado correctamente.');
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo crear el administrador.'];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
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
      <h1 className="page-title">Administradores</h1>
      <p className="page-sub">Alta, edición y baja de cuentas de administrador.</p>
      <ErrorBanner messages={errors} />
      <div className="toolbar">
        <input
          className="search"
          placeholder="Buscar por nombre o email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setCreating((v) => !v)}>{creating ? 'Cancelar' : '+ Nuevo administrador'}</Button>
      </div>

      {creating && (
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
              {submitting ? 'Creando…' : 'Crear administrador'}
            </Button>
          </form>
        </FormCard>
      )}

      <EntityTable
        rows={filtered}
        columns={[
          { label: 'Nombre', render: (a) => `${a.firstName} ${a.lastName}` },
          { label: 'DNI', render: (a) => a.dni },
          { label: 'Email', render: (a) => a.email },
        ]}
        renderActions={(admin) => (
          <button className="icon-btn danger" title="Eliminar" onClick={() => setPendingDelete(admin)}>
            ✕
          </button>
        )}
      />

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
