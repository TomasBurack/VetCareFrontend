import { useEffect, useState } from 'react';
import { veterinarianApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/useAuth';
import { FormCard } from '../../components/FormCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';
import { TwoFactorSettings } from '../../components/TwoFactorSettings';
import { SPECIALITIES } from '../../constants/speciality';

export function VetProfile() {
  const { logout } = useAuth();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    veterinarianApi.myUser().then((user) => {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        dni: user.dni,
        phoneNumber: user.phoneNumber,
        email: user.email,
        enrollment: user.enrollment,
        speciality: user.speciality,
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
      await veterinarianApi.updateMyUser(form);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudieron guardar los cambios.']);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await veterinarianApi.deleteMyUser();
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
      <p className="page-sub">Tus datos profesionales.</p>
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

          <div className="section-title">Datos profesionales</div>
          <div className="grid cols-2">
            <Field
              label="Matrícula"
              style={{ fontFamily: 'var(--font-mono)' }}
              value={form.enrollment}
              onChange={update('enrollment')}
            />
            <Field label="Especialidad">
              <select className="f" value={form.speciality} onChange={update('speciality')}>
                {SPECIALITIES.map((speciality) => (
                  <option key={speciality.value} value={speciality.value}>
                    {speciality.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: 'flex', gap: '.6rem' }}>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
        <TwoFactorSettings />
        <div className="danger-zone">
          <div className="t">Eliminar cuenta</div>
          <div className="sub">Perderás el acceso a tus turnos asignados. Solo un administrador puede recrear tu cuenta.</div>
          <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
            Eliminar mi cuenta
          </Button>
        </div>
      </FormCard>

      {confirmingDelete && (
        <ConfirmDeleteOverlay
          title="Eliminar mi cuenta"
          description="Perderás el acceso a tus turnos asignados. No se puede deshacer."
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
