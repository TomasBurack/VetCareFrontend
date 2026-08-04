import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/useAuth';
import { ApiError } from '../../api/client';
import { useToast } from '../../context/useToast';
import { useLanguage } from '../../i18n/useLanguage';

export function ResetPassword() {
  const { resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrors([t.auth.passwordsDontMatch]);
      return;
    }
    setErrors([]);
    setSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      toast.success(t.auth.resetSuccessShort);
      navigate('/login', { replace: true });
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.auth.resetErrorShort];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title={t.auth.resetTitle} subtitle={t.auth.resetSubtitleToken}>
      <ErrorBanner messages={errors} />
      <form onSubmit={handleSubmit}>
        <Field
          label={t.auth.newPassword}
          type="password"
          required
          placeholder={t.common.minEightChars}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Field
          label={t.auth.confirmPassword}
          type="password"
          required
          placeholder={t.auth.repeatPassword}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
          {submitting ? t.auth.resetting2 : t.auth.resetSubmitLong}
        </Button>
      </form>
      <div className="auth-footer">
        <Link to="/login">{t.auth.backToLogin}</Link>
      </div>
    </AuthCard>
  );
}
