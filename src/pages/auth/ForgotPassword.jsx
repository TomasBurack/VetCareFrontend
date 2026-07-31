import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/useAuth';
import { ApiError } from '../../api/client';
import { useToast } from '../../context/useToast';

export function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
      toast.success('Te enviamos un email con instrucciones.');
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo procesar la solicitud.'];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Olvidé mi contraseña"
      subtitle="Ingresá tu email. Si existe una cuenta asociada, vas a recibir instrucciones para restablecer tu contraseña."
    >
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
        <Button type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
          {submitting ? 'Enviando…' : 'Enviar instrucciones'}
        </Button>
      </form>
      {sent && (
        <div
          style={{
            marginTop: '1rem',
            padding: '.8rem 1rem',
            background: 'var(--bg-alt)',
            borderRadius: '9px',
            fontSize: '.78rem',
            color: 'var(--sage-muted)',
          }}
        >
          Por seguridad, siempre mostramos este mismo mensaje exista o no la cuenta.
        </div>
      )}
      <div className="auth-footer">
        <Link to="/login">Volver a iniciar sesión</Link>
      </div>
    </AuthCard>
  );
}
