import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/useAuth';
import { ROLE_HOME } from '../../context/roleHome';
import { ApiError } from '../../api/client';
import { useToast } from '../../context/useToast';
import { useLanguage } from '../../i18n/useLanguage';

export function Login() {
  const { login, verifyTwoFactor } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

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
        toast.success(t.auth.loginSuccess);
        goToDestination(result);
      }
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.auth.loginErrorRetry];
      setErrors(messages);
      toast.error(messages[0]);
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
      toast.success(t.auth.loginSuccess);
      goToDestination(session);
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.auth.invalidCodeRetry];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  if (pendingToken) {
    return (
      <AuthCard title={t.auth.twoFactorTitle} subtitle={t.auth.twoFactorSubtitle}>
        <ErrorBanner messages={errors} />
        <form onSubmit={handleVerifySubmit}>
          <Field
            label={t.auth.codeLabel}
            required
            autoFocus
            placeholder={t.auth.codePlaceholder}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
            {submitting ? t.twoFactor.verifying : t.twoFactor.verifySubmit}
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
            {t.auth.backToLogin}
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t.auth.loginTitle} subtitle={t.auth.loginSubtitleShort}>
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
        <Field
          label={t.common.password}
          type="password"
          required
          placeholder={t.common.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div style={{ textAlign: 'right', marginTop: '-0.7rem', marginBottom: '1.1rem' }}>
          <Link to="/forgot-password" style={{ fontSize: '.78rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            {t.auth.forgotPassword}
          </Link>
        </div>
        <Button type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
          {submitting ? t.auth.loggingIn : t.auth.loginSubmit}
        </Button>
      </form>
      <div className="auth-footer">
        {t.auth.noAccount} <Link to="/register">{t.auth.createOne}</Link>
      </div>
    </AuthCard>
  );
}
