import { useEffect, useState } from 'react';
import { sysadminApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { FormCard } from '../../components/FormCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { TwoFactorSettings } from '../../components/TwoFactorSettings';

export function SysadminProfile() {
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    sysadminApi.myUser().then((user) => {
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
      await sysadminApi.updateMyUser(form);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudieron guardar los cambios.']);
    } finally {
      setSaving(false);
    }
  }

  if (!form) return null;

  return (
    <>
      <h1 className="page-title">Mi perfil</h1>
      <p className="page-sub">Tus datos de superusuario del sistema.</p>
      <FormCard maxWidth={520}>
        <ErrorBanner messages={errors} />
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
          <div style={{ display: 'flex', gap: '.6rem' }}>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
        <TwoFactorSettings />
      </FormCard>
    </>
  );
}
