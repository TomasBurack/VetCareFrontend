import { useEffect, useState } from 'react';
import { administratorApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/useAuth';
import { FormCard } from '../../components/FormCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';
import { TwoFactorSettings } from '../../components/TwoFactorSettings';
import { useToast } from '../../context/useToast';
import { useLanguage } from '../../i18n/useLanguage';

export function AdminProfile() {
  const { logout } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    administratorApi.myUser().then((user) => {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        dni: user.dni,
        phoneNumber: user.phoneNumber,
        email: user.email,
      });
    });
  }, []);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSaving(true);
    try {
      await administratorApi.updateMyUser(form);
      toast.success(t.profile.saved);
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.profile.saveError];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await administratorApi.deleteMyUser();
      toast.success(t.profile.deleted);
      logout();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.profile.deleteError];
      setErrors(messages);
      toast.error(messages[0]);
      setConfirmingDelete(false);
    }
  }

  if (!form) return null;

  return (
    <>
      <h1 className="page-title">{t.profile.title}</h1>
      <p className="page-sub">{t.profile.subtitleAdmin}</p>
      <FormCard maxWidth={520}>
        <ErrorBanner messages={errors} />
        <form onSubmit={handleSubmit}>
          <div className="grid cols-2">
            <Field label={t.common.firstName} value={form.firstName} onChange={update('firstName')} />
            <Field label={t.common.lastName} value={form.lastName} onChange={update('lastName')} />
          </div>
          <div className="grid cols-2">
            <Field label={t.common.dni} style={{ fontFamily: 'var(--font-mono)' }} value={form.dni} onChange={update('dni')} />
            <Field label={t.common.phone} value={form.phoneNumber} onChange={update('phoneNumber')} />
          </div>
          <Field label={t.common.email} type="email" value={form.email} onChange={update('email')} />
          <div style={{ display: 'flex', gap: '.6rem' }}>
            <Button type="submit" disabled={saving}>
              {saving ? t.common.saving : t.common.saveChanges}
            </Button>
          </div>
        </form>
        <TwoFactorSettings />
        <div className="danger-zone">
          <div className="t">{t.profile.deleteAccountHeading}</div>
          <div className="sub">{t.profile.deleteNoteAdmin}</div>
          <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
            {t.profile.deleteAccount}
          </Button>
        </div>
      </FormCard>

      {confirmingDelete && (
        <ConfirmDeleteOverlay
          title={t.profile.deleteAccountTitle}
          description={t.profile.deleteConfirmAdmin}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
