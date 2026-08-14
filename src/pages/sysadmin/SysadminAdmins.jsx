import { useEffect, useState } from 'react';
import { sysadminApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { EntityTable } from '../../components/EntityTable';
import { Button } from '../../components/Button';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';
import { Field } from '../../components/Field';
import { FormCard } from '../../components/FormCard';
import { useToast } from '../../context/useToast';
import { useLanguage } from '../../i18n/useLanguage';

const EMPTY_FORM = { firstName: '', lastName: '', dni: '', phoneNumber: '', email: '', password: '' };

export function SysadminAdmins() {
  const toast = useToast();
  const { t } = useLanguage();
  const [admins, setAdmins] = useState([]);
  const [errors, setErrors] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const isFormOpen = creating || editingId !== null;

  async function load() {
    try {
      const data = await sysadminApi.allAdmins();
      setAdmins(data ?? []);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : [t.sysadminAdmins.loadError]);
    }
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch on mount only; `load` closes over `t` but must not re-run on language change
  }, []);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      if (editingId !== null) {
        const payload = { ...form };
        delete payload.password;
        await sysadminApi.update(editingId, payload);
        toast.success(t.sysadminAdmins.updated);
      } else {
        await sysadminApi.create(form);
        toast.success(t.sysadminAdmins.created);
      }
      setForm(EMPTY_FORM);
      setCreating(false);
      setEditingId(null);
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.sysadminAdmins.saveError];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(admin) {
    setForm({ ...EMPTY_FORM, ...admin, password: '' });
    setEditingId(admin.id);
    setCreating(false);
  }

  function closeForm() {
    setForm(EMPTY_FORM);
    setCreating(false);
    setEditingId(null);
  }

  async function confirmDelete() {
    try {
      await sysadminApi.remove(pendingDelete.id);
      setPendingDelete(null);
      toast.success(t.sysadminAdmins.deleted);
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.sysadminAdmins.deleteError];
      setErrors(messages);
      toast.error(messages[0]);
      setPendingDelete(null);
    }
  }

  return (
    <>
      <h1 className="page-title">
        {editingId !== null
          ? t.sysadminAdmins.titleEdit
          : creating
            ? t.sysadminAdmins.titleNew
            : t.sysadminAdmins.title}
      </h1>
      <p className="page-sub">
        {editingId !== null
          ? t.sysadminAdmins.subtitleEdit
          : creating
            ? t.sysadminAdmins.subtitleNew
            : t.sysadminAdmins.subtitle}
      </p>
      <ErrorBanner messages={errors} />
      <div className="toolbar">
        <div />
        {isFormOpen ? (
          <Button variant="outline" onClick={closeForm}>
            {t.common.cancel}
          </Button>
        ) : (
          <Button onClick={() => setCreating(true)}>{t.sysadminAdmins.new}</Button>
        )}
      </div>

      {isFormOpen ? (
        <FormCard maxWidth={520}>
          <form onSubmit={handleCreate}>
            <div className="grid cols-2">
              <Field
                label={t.common.firstName}
                required
                placeholder={t.sysadminAdmins.placeholders.firstName}
                value={form.firstName}
                onChange={update('firstName')}
              />
              <Field
                label={t.common.lastName}
                required
                placeholder={t.sysadminAdmins.placeholders.lastName}
                value={form.lastName}
                onChange={update('lastName')}
              />
            </div>
            <div className="grid cols-2">
              <Field
                label={t.common.dni}
                required
                placeholder={t.sysadminAdmins.placeholders.dni}
                value={form.dni}
                onChange={update('dni')}
              />
              <Field
                label={t.common.phone}
                required
                placeholder={t.sysadminAdmins.placeholders.phone}
                value={form.phoneNumber}
                onChange={update('phoneNumber')}
              />
            </div>
            <Field
              label={t.common.email}
              type="email"
              required
              placeholder={t.sysadminAdmins.placeholders.email}
              value={form.email}
              onChange={update('email')}
            />
            {editingId === null && (
              <Field
                label={t.common.tempPassword}
                type="password"
                required
                placeholder={t.common.passwordPlaceholder}
                value={form.password}
                onChange={update('password')}
              />
            )}
            <Button type="submit" disabled={submitting}>
              {submitting
                ? t.common.saving
                : editingId !== null
                  ? t.common.saveChanges
                  : t.sysadminAdmins.submit}
            </Button>
          </form>
        </FormCard>
      ) : (
        <EntityTable
          rows={admins}
          columns={[
            { label: t.common.name, render: (a) => `${a.firstName} ${a.lastName}` },
            { label: t.common.dni, render: (a) => a.dni },
            { label: t.common.email, render: (a) => a.email },
          ]}
          renderActions={(admin) => (
            <div className="actions">
              <button className="btn-text" onClick={() => startEdit(admin)}>
                {t.common.edit}
              </button>
              <button className="btn-text danger" onClick={() => setPendingDelete(admin)}>
                {t.common.delete}
              </button>
            </div>
          )}
        />
      )}

      {pendingDelete && (
        <ConfirmDeleteOverlay
          title={t.sysadminAdmins.deleteTitle(
            `${pendingDelete.firstName} ${pendingDelete.lastName}`,
          )}
          description={t.sysadminAdmins.deleteDescription}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
