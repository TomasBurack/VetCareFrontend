import { useEffect, useState } from 'react';
import { veterinarianApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/useAuth';
import { FormCard } from '../../components/FormCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';
import { TwoFactorSettings } from '../../components/TwoFactorSettings';
import { SPECIALITY_VALUES } from '../../constants/speciality';
import { useToast } from '../../context/useToast';
import { useLanguage } from '../../i18n/useLanguage';

export function VetProfile() {
  const { logout } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    veterinarianApi.myUser().then((user) => {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        dni: user.dni,
        phoneNumber: user.phoneNumber,
        email: user.email,
        enrollment: user.enrollment,
        speciality: user.speciality,
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
      await veterinarianApi.updateMyUser(form);
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
      await veterinarianApi.deleteMyUser();
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
      <p className="page-sub">{t.profile.subtitleVet}</p>
      <FormCard maxWidth={520}>
        <ErrorBanner messages={errors} />
        <div className="section-title">{t.profile.personalData}</div>
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

          <div className="section-title">{t.profile.professionalData}</div>
          <div className="grid cols-2">
            <Field
              label={t.adminVets.enrollment}
              style={{ fontFamily: 'var(--font-mono)' }}
              value={form.enrollment}
              onChange={update('enrollment')}
            />
            <Field label={t.adminVets.speciality}>
              <select className="f" value={form.speciality} onChange={update('speciality')}>
                {SPECIALITY_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {t.specialities[value]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: 'flex', gap: '.6rem' }}>
            <Button type="submit" disabled={saving}>
              {saving ? t.common.saving : t.common.saveChanges}
            </Button>
          </div>
        </form>
        <TwoFactorSettings />
        <div className="danger-zone">
          <div className="t">{t.profile.deleteAccountHeading}</div>
          <div className="sub">{t.profile.deleteNoteVet}</div>
          <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
            {t.profile.deleteAccount}
          </Button>
        </div>
      </FormCard>

      {confirmingDelete && (
        <ConfirmDeleteOverlay
          title={t.profile.deleteAccountTitle}
          description={t.profile.deleteConfirmVet}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
