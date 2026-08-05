import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/useAuth';
import { ROLE_HOME } from '../../context/roleHome';
import { ApiError } from '../../api/client';
import { useToast } from '../../context/useToast';
import { useLanguage } from '../../i18n/useLanguage';
import { groupErrorsByField } from '../../i18n/fieldErrors';

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
  const toast = useToast();
  const { t, tApiList } = useLanguage();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { byField, rest } = groupErrorsByField(errors);
  const fieldErrors = Object.fromEntries(
    Object.entries(byField).map(([field, messages]) => [field, tApiList(messages)]),
  );
  const passwordErrors = [...(fieldErrors.password ?? []), ...tApiList(rest)];

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const session = await register(form);
      toast.success(t.auth.registerCreated);
      navigate(ROLE_HOME[session.role] ?? '/', { replace: true });
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.auth.registerErrorRetry];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title={t.auth.registerTitle} subtitle={t.auth.registerSubtitleLong}>
      <form onSubmit={handleSubmit}>
        <div className="grid cols-2">
          <Field
            label={t.common.firstName}
            required
            placeholder={t.auth.placeholders.firstName}
            value={form.firstName}
            onChange={update('firstName')}
            errors={fieldErrors.firstName}
          />
          <Field
            label={t.common.lastName}
            required
            placeholder={t.auth.placeholders.lastName}
            value={form.lastName}
            onChange={update('lastName')}
            errors={fieldErrors.lastName}
          />
        </div>
        <div className="grid cols-2">
          <Field
            label={t.common.dni}
            required
            placeholder={t.auth.placeholders.dni}
            value={form.dni}
            onChange={update('dni')}
            errors={fieldErrors.dni}
          />
          <Field
            label={t.common.phone}
            required
            placeholder={t.auth.placeholders.phone}
            value={form.phoneNumber}
            onChange={update('phoneNumber')}
            errors={fieldErrors.phoneNumber}
          />
        </div>
        <Field
          label={t.common.email}
          type="email"
          required
          placeholder={t.common.emailPlaceholder}
          value={form.email}
          onChange={update('email')}
          errors={fieldErrors.email}
        />
        <Field
          label={t.common.password}
          type="password"
          required
          placeholder={t.common.minEightChars}
          value={form.password}
          onChange={update('password')}
          errors={passwordErrors.length > 0 ? passwordErrors : undefined}
        />
        <Button type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: '.25rem' }}>
          {submitting ? t.auth.registering : t.auth.registerSubmit}
        </Button>
      </form>
      <div className="auth-footer">
        {t.auth.hasAccount} <Link to="/login">{t.auth.signInLink}</Link>
      </div>
    </AuthCard>
  );
}
