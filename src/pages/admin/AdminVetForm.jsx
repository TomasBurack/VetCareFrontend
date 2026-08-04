import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { veterinarianApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { FormCard } from '../../components/FormCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { SPECIALITIES } from '../../constants/speciality';
import { useToast } from '../../context/useToast';

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
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    veterinarianApi.getById(id).then((vet) => {
      setForm({ ...EMPTY_FORM, ...vet, password: '' });
    });
  }, [id, isEditing]);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      if (isEditing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await veterinarianApi.update(id, payload);
        toast.success('Veterinario actualizado correctamente.');
      } else {
        await veterinarianApi.create(form);
        toast.success('Veterinario creado correctamente.');
      }
      navigate('/veterinarios');
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo guardar el veterinario.'];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="page-title">{isEditing ? 'Editar veterinario' : 'Nuevo veterinario'}</h1>
      <p className="page-sub">
        {isEditing ? 'Modifica los datos de la cuenta del veterinario.' : 'Crea una cuenta de veterinario con acceso al panel.'}
      </p>
      <div className="toolbar">
        <Button variant="outline" onClick={() => navigate('/veterinarios')}>
          Cancelar
        </Button>
      </div>
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
            required={!isEditing}
            placeholder={isEditing ? 'Dejar en blanco para no cambiarla' : 'Se le pedirá cambiarla en el primer ingreso'}
            value={form.password}
            onChange={update('password')}
          />

          <div className="section-title">Datos profesionales</div>
          <div className="grid cols-2">
            <Field
              label="Matrícula"
              required
              style={{ fontFamily: 'var(--font-mono)' }}
              placeholder="5383"
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

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear veterinario'}
          </Button>
        </form>
      </FormCard>
    </>
  );
}
