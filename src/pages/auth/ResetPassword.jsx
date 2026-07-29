import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/useAuth';
import { ApiError } from '../../api/client';
import { useToast } from '../../context/useToast';

export function ResetPassword() {
  const { resetPassword } = useAuth();
  const toast = useToast();
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
      toast.success('Contraseña actualizada correctamente.');
      navigate('/login', { replace: true });
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo actualizar la contraseña.'];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Restablecer contraseña" subtitle="El enlace de tu email incluye un token válido por tiempo limitado.">
      <ErrorBanner messages={errors} />
      <form onSubmit={handleSubmit}>
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
