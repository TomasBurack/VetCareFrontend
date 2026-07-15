import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/useAuth';
import { ROLE_HOME } from '../../context/roleHome';
import { ApiError } from '../../api/client';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const session = await login(email, password);
      const target = location.state?.from?.pathname ?? ROLE_HOME[session.role] ?? '/';
      navigate(target, { replace: true });
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudo iniciar sesión. Intentá de nuevo.']);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Iniciar sesión" subtitle="Accedé a tus turnos, mascotas y perfil.">
      <ErrorBanner messages={errors} />
      <form onSubmit={handleSubmit}>
        <Field
          label="Email"
          type="email"
          required
          placeholder="nombre@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Contraseña"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div style={{ textAlign: 'right', marginTop: '-0.7rem', marginBottom: '1.1rem' }}>
          <Link to="/forgot-password" style={{ fontSize: '.78rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Button type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
      <div className="auth-footer">
        ¿No tenés cuenta? <Link to="/register">Creá una</Link>
      </div>
    </AuthCard>
  );
}
