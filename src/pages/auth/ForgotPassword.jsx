import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/useAuth';
import { ApiError } from '../../api/client';
import { useToast } from '../../context/useToast';
import { useLanguage } from '../../i18n/useLanguage';

export function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
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
      toast.success(t.auth.forgotSentToast);
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.auth.forgotRequestError];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title={t.auth.forgotTitleLong} subtitle={t.auth.forgotSubtitleLong}>
      <ErrorBanner messages={errors} />
      <form onSubmit={handleSubmit}>
        <Field
          label={t.common.email}
          type="email"
          required
          placeholder={t.common.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
          {submitting ? t.auth.forgotSending : t.auth.forgotSubmitLong}
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
          {t.auth.forgotSecurityNote}
        </div>
      )}
      <div className="auth-footer">
        <Link to="/login">{t.auth.backToLogin}</Link>
      </div>
    </AuthCard>
  );
}
