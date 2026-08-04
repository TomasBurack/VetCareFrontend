import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { veterinarianApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { FormCard } from '../../components/FormCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { SPECIALITY_VALUES } from '../../constants/speciality';
import { useToast } from '../../context/useToast';
import { useLanguage } from '../../i18n/useLanguage';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  dni: '',
  phoneNumber: '',
  email: '',
  password: '',
  enrollment: '',
  speciality: SPECIALITY_VALUES[0],
};

export function AdminVetForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    veterinarianApi.getById(id).then((vet) => {
      setForm({ ...EMPTY_FORM, ...vet, password: '' });
    });
  }, [id, isEditing]);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      if (isEditing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await veterinarianApi.update(id, payload);
        toast.success(t.adminVetForm.updated);
      } else {
        await veterinarianApi.create(form);
        toast.success(t.adminVetForm.created);
      }
      navigate('/veterinarios');
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.adminVetForm.error];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="page-title">{isEditing ? t.adminVetForm.titleEdit : t.adminVetForm.titleNew}</h1>
      <p className="page-sub">
        {isEditing ? t.adminVetForm.subtitleEdit : t.adminVetForm.subtitleNew}
      </p>
      <div className="toolbar">
        <Button variant="outline" onClick={() => navigate('/veterinarios')}>
          {t.common.cancel}
        </Button>
      </div>
      <FormCard maxWidth={520}>
        <ErrorBanner messages={errors} />
        <div className="section-title">{t.adminVetForm.personalData}</div>
        <form onSubmit={handleSubmit}>
          <div className="grid cols-2">
            <Field
              label={t.common.firstName}
              required
              placeholder={t.adminVetForm.placeholders.firstName}
              value={form.firstName}
              onChange={update('firstName')}
            />
            <Field
              label={t.common.lastName}
              required
              placeholder={t.adminVetForm.placeholders.lastName}
              value={form.lastName}
              onChange={update('lastName')}
            />
          </div>
          <div className="grid cols-2">
            <Field
              label={t.common.dni}
              required
              placeholder={t.adminVetForm.placeholders.dni}
              value={form.dni}
              onChange={update('dni')}
            />
            <Field
              label={t.common.phone}
              required
              placeholder={t.adminVetForm.placeholders.phone}
              value={form.phoneNumber}
              onChange={update('phoneNumber')}
            />
          </div>
          <Field
            label={t.common.email}
            type="email"
            required
            placeholder={t.adminVetForm.placeholders.email}
            value={form.email}
            onChange={update('email')}
          />
          <Field
            label={t.common.tempPassword}
            type="password"
            required={!isEditing}
            placeholder={isEditing ? t.common.passwordHintKeep : t.common.passwordHintNew}
            value={form.password}
            onChange={update('password')}
          />

          <div className="section-title">{t.adminVetForm.professionalData}</div>
          <div className="grid cols-2">
            <Field
              label={t.adminVets.enrollment}
              required
              style={{ fontFamily: 'var(--font-mono)' }}
              placeholder={t.adminVetForm.placeholders.enrollment}
              value={form.enrollment}
              onChange={update('enrollment')}
            />
            <Field label={t.adminVets.speciality} required>
              <select className="f" value={form.speciality} onChange={update('speciality')}>
                {SPECIALITY_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {t.specialities[value]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting
              ? t.common.saving
              : isEditing
                ? t.common.saveChanges
                : t.adminVetForm.submitNew}
          </Button>
        </form>
      </FormCard>
    </>
  );
}
