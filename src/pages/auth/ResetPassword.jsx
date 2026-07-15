import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/useAuth';
import { ApiError } from '../../api/client';

export function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrors(['Las contraseñas no coinciden.']);
      return;
    }
    setErrors([]);
    setSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      navigate('/login', { replace: true });
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudo actualizar la contraseña.']);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Restablecer contraseña" subtitle="El enlace de tu email incluye un token válido por tiempo limitado.">
      <ErrorBanner messages={errors} />
      <form onSubmit={handleSubmit}>
        <Field label="Token" value={token} readOnly style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem' }} />
        <Field
          label="Nueva contraseña"
          type="password"
          required
          placeholder="Mínimo 8 caracteres"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Field
          label="Confirmar contraseña"
          type="password"
          required
          placeholder="Repetí la contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
          {submitting ? 'Actualizando…' : 'Actualizar contraseña'}
        </Button>
      </form>
      <div className="auth-footer">
        <Link to="/login">Volver a iniciar sesión</Link>
      </div>
    </AuthCard>
  );
}
