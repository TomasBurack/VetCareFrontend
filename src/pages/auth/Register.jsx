import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/useAuth';
import { ROLE_HOME } from '../../context/roleHome';
import { ApiError } from '../../api/client';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  dni: '',
  phoneNumber: '',
  email: '',
  password: '',
};

export function Register() {
  const { register } = useAuth();
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
      const session = await register(form);
      navigate(ROLE_HOME[session.role] ?? '/', { replace: true });
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudo crear la cuenta. Intentá de nuevo.']);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Te registrás como cliente. Los roles de veterinario y administrador se asignan desde el panel de administración."
    >
      <ErrorBanner messages={errors} />
      <form onSubmit={handleSubmit}>
        <div className="grid cols-2">
          <Field label="Nombre" required placeholder="Agustín" value={form.firstName} onChange={update('firstName')} />
          <Field label="Apellido" required placeholder="Sentis" value={form.lastName} onChange={update('lastName')} />
        </div>
        <div className="grid cols-2">
          <Field label="DNI" required placeholder="30123456" value={form.dni} onChange={update('dni')} />
          <Field
            label="Teléfono"
            required
            placeholder="+54 9 11 5555-0100"
            value={form.phoneNumber}
            onChange={update('phoneNumber')}
          />
        </div>
        <Field
          label="Email"
          type="email"
          required
          placeholder="nombre@correo.com"
          value={form.email}
          onChange={update('email')}
        />
        <Field
          label="Contraseña"
          type="password"
          required
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChange={update('password')}
        />
        <Button type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: '.25rem' }}>
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
      <div className="auth-footer">
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
      </div>
    </AuthCard>
  );
}
