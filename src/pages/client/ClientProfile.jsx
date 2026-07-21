import { useEffect, useState } from 'react';
import { clientApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/useAuth';
import { FormCard } from '../../components/FormCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';
import { TwoFactorSettings } from '../../components/TwoFactorSettings';

export function ClientProfile() {
  const { logout } = useAuth();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    clientApi.myUser().then((user) => {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        dni: user.dni,
        phoneNumber: user.phoneNumber,
        email: user.email,
      });
    });
  }, []);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSaving(true);
    try {
      await clientApi.updateMyUser(form);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudieron guardar los cambios.']);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await clientApi.deleteMyUser();
      logout();
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudo eliminar la cuenta.']);
      setConfirmingDelete(false);
    }
  }

  if (!form) return null;

  return (
    <>
      <h1 className="page-title">Mi perfil</h1>
      <p className="page-sub">Tus datos personales de contacto.</p>
      <FormCard maxWidth={520}>
        <ErrorBanner messages={errors} />
        <div className="section-title">Datos personales</div>
        <form onSubmit={handleSubmit}>
          <div className="grid cols-2">
            <Field label="Nombre" value={form.firstName} onChange={update('firstName')} />
            <Field label="Apellido" value={form.lastName} onChange={update('lastName')} />
          </div>
          <div className="grid cols-2">
            <Field label="DNI" style={{ fontFamily: 'var(--font-mono)' }} value={form.dni} onChange={update('dni')} />
            <Field label="Teléfono" value={form.phoneNumber} onChange={update('phoneNumber')} />
          </div>
          <Field label="Email" type="email" value={form.email} onChange={update('email')} />
          <div style={{ display: 'flex', gap: '.6rem', marginTop: '.25rem' }}>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
        <TwoFactorSettings />
        <div className="danger-zone">
          <div className="t">Eliminar cuenta</div>
          <div className="sub">Se eliminan tus datos, mascotas y turnos asociados. Esta acción no se puede deshacer.</div>
          <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
            Eliminar mi cuenta
          </Button>
        </div>
      </FormCard>

      {confirmingDelete && (
        <ConfirmDeleteOverlay
          title="Eliminar mi cuenta"
          description="Esta acción elimina tu cuenta, mascotas y turnos. No se puede deshacer."
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
