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
  const { login, verifyTwoFactor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingToken, setPendingToken] = useState(null);
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function goToDestination(session) {
    const target = location.state?.from?.pathname ?? ROLE_HOME[session.role] ?? '/';
    navigate(target, { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.twoFactorRequired) {
        setPendingToken(result.pendingToken);
      } else {
        goToDestination(result);
      }
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudo iniciar sesión. Intentá de nuevo.']);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifySubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const session = await verifyTwoFactor(pendingToken, code);
      goToDestination(session);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['Código inválido. Intentá de nuevo.']);
    } finally {
      setSubmitting(false);
    }
  }

  if (pendingToken) {
    return (
      <AuthCard
        title="Verificación en dos pasos"
        subtitle="Ingresá el código de 6 dígitos de tu app de autenticación, o un código de recuperación."
      >
        <ErrorBanner messages={errors} />
        <form onSubmit={handleVerifySubmit}>
          <Field
            label="Código"
            required
            autoFocus
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
            {submitting ? 'Verificando…' : 'Verificar'}
          </Button>
        </form>
        <div className="auth-footer">
          <button
            type="button"
            onClick={() => {
              setPendingToken(null);
              setCode('');
              setErrors([]);
            }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
          >
            Volver a iniciar sesión
          </button>
        </div>
      </AuthCard>
    );
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
