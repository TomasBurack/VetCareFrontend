import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { veterinarianApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { FormCard } from '../../components/FormCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { SPECIALITIES } from '../../constants/speciality';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  dni: '',
  phoneNumber: '',
  email: '',
  password: '',
  enrollment: '',
  speciality: SPECIALITIES[0].value,
};

export function AdminVetForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await veterinarianApi.create(form);
      navigate('/veterinarios');
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudo crear el veterinario.']);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="page-title">Nuevo veterinario</h1>
      <p className="page-sub">Crea una cuenta de veterinario con acceso al panel.</p>
      <FormCard maxWidth={520}>
        <ErrorBanner messages={errors} />
        <div className="section-title">Datos personales</div>
        <form onSubmit={handleSubmit}>
          <div className="grid cols-2">
            <Field label="Nombre" required placeholder="Bianca" value={form.firstName} onChange={update('firstName')} />
            <Field label="Apellido" required placeholder="Solaro" value={form.lastName} onChange={update('lastName')} />
          </div>
          <div className="grid cols-2">
            <Field label="DNI" required placeholder="30556781" value={form.dni} onChange={update('dni')} />
            <Field
              label="Teléfono"
              required
              placeholder="+54 9 11 2200-1147"
              value={form.phoneNumber}
              onChange={update('phoneNumber')}
            />
          </div>
          <Field label="Email" type="email" required placeholder="bianca.solaro@vetcare.com" value={form.email} onChange={update('email')} />
          <Field
            label="Contraseña temporal"
            type="password"
            required
            placeholder="Se le pedirá cambiarla en el primer ingreso"
            value={form.password}
            onChange={update('password')}
          />

          <div className="section-title">Datos profesionales</div>
          <div className="grid cols-2">
            <Field
              label="Matrícula"
              required
              style={{ fontFamily: 'var(--font-mono)' }}
              placeholder="MP 5104"
              value={form.enrollment}
              onChange={update('enrollment')}
            />
            <Field label="Especialidad" required>
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
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creando…' : 'Crear veterinario'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/veterinarios')}>
              Cancelar
            </Button>
          </div>
        </form>
      </FormCard>
    </>
  );
}
