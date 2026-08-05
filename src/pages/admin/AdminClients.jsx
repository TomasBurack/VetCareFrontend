import { useEffect, useState } from 'react';
import { clientApi, petApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { EntityTable } from '../../components/EntityTable';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';
import { ClientPetsOverlay } from '../../components/ClientPetsOverlay';
import { Field } from '../../components/Field';
import { FormCard } from '../../components/FormCard';
import { Button } from '../../components/Button';
import { useToast } from '../../context/useToast';
import { useLanguage } from '../../i18n/useLanguage';

const EMPTY_FORM = { firstName: '', lastName: '', dni: '', phoneNumber: '', email: '', password: '' };

export function AdminClients() {
  const toast = useToast();
  const { t } = useLanguage();
  const [clients, setClients] = useState([]);
  const [errors, setErrors] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const isFormOpen = creating || editingId !== null;
  const [viewingPetsFor, setViewingPetsFor] = useState(null);
  const [clientPets, setClientPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [petsError, setPetsError] = useState(null);

  async function load() {
    try {
      const data = await clientApi.all();
      setClients(data ?? []);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : [t.adminClients.loadError]);
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
        if (!payload.password) delete payload.password;
        await clientApi.update(editingId, payload);
        toast.success(t.adminClients.updated);
      } else {
        await clientApi.create(form);
        toast.success(t.adminClients.created);
      }
      setForm(EMPTY_FORM);
      setCreating(false);
      setEditingId(null);
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.adminClients.saveError];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(client) {
    setForm({ ...EMPTY_FORM, ...client, password: '' });
    setEditingId(client.id);
    setCreating(false);
  }

  function closeForm() {
    setForm(EMPTY_FORM);
    setCreating(false);
    setEditingId(null);
  }

  async function viewPets(client) {
    setViewingPetsFor(client);
    setPetsLoading(true);
    setPetsError(null);
    try {
      const allPets = await petApi.allAdmin();
      setClientPets((allPets ?? []).filter((p) => p.ownerEmail === client.email));
    } catch (err) {
      setPetsError(err instanceof ApiError ? err.messages[0] : t.adminClients.petsLoadError);
    } finally {
      setPetsLoading(false);
    }
  }

  function closePetsView() {
    setViewingPetsFor(null);
    setClientPets([]);
    setPetsError(null);
  }

  async function confirmDelete() {
    try {
      await clientApi.remove(pendingDelete.id);
      setPendingDelete(null);
      toast.success(t.adminClients.deleted);
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.adminClients.deleteError];
      setErrors(messages);
      toast.error(messages[0]);
      setPendingDelete(null);
    }
  }

  return (
    <>
      <h1 className="page-title">
        {editingId !== null
          ? t.adminClients.titleEdit
          : creating
            ? t.adminClients.titleNew
            : t.adminClients.title}
      </h1>
      <p className="page-sub">
        {editingId !== null
          ? t.adminClients.subtitleEdit
          : creating
            ? t.adminClients.subtitleNew
            : t.adminClients.subtitle}
      </p>
      <ErrorBanner messages={errors} />
      <div className="toolbar">
        <div />
        {isFormOpen ? (
          <Button variant="outline" onClick={closeForm}>
            {t.common.cancel}
          </Button>
        ) : (
          <Button onClick={() => setCreating(true)}>{t.adminClients.new}</Button>
        )}
      </div>

      {isFormOpen ? (
        <FormCard maxWidth={520}>
          <form onSubmit={handleCreate}>
            <div className="grid cols-2">
              <Field
                label={t.common.firstName}
                required
                placeholder={t.adminClients.placeholders.firstName}
                value={form.firstName}
                onChange={update('firstName')}
              />
              <Field
                label={t.common.lastName}
                required
                placeholder={t.adminClients.placeholders.lastName}
                value={form.lastName}
                onChange={update('lastName')}
              />
            </div>
            <div className="grid cols-2">
              <Field
                label={t.common.dni}
                required
                placeholder={t.adminClients.placeholders.dni}
                value={form.dni}
                onChange={update('dni')}
              />
              <Field
                label={t.common.phone}
                required
                placeholder={t.adminClients.placeholders.phone}
                value={form.phoneNumber}
                onChange={update('phoneNumber')}
              />
            </div>
            <Field
              label={t.common.email}
              type="email"
              required
              placeholder={t.adminClients.placeholders.email}
              value={form.email}
              onChange={update('email')}
            />
            <Field
              label={t.common.tempPassword}
              type="password"
              required={editingId === null}
              placeholder={editingId !== null ? t.common.passwordHintKeep : t.common.passwordHintNew}
              value={form.password}
              onChange={update('password')}
            />
            <Button type="submit" disabled={submitting}>
              {submitting
                ? t.common.saving
                : editingId !== null
                  ? t.common.saveChanges
                  : t.adminClients.submit}
            </Button>
          </form>
        </FormCard>
      ) : (
        <EntityTable
          rows={clients}
          columns={[
            { label: t.common.name, render: (c) => `${c.firstName} ${c.lastName}` },
            { label: t.common.dni, render: (c) => c.dni },
            { label: t.common.email, render: (c) => c.email },
          ]}
          renderActions={(client) => (
            <div className="actions">
              <button className="btn-text" onClick={() => viewPets(client)}>
                {t.adminClients.viewPets}
              </button>
              <button className="btn-text" onClick={() => startEdit(client)}>
                {t.common.edit}
              </button>
              <button className="btn-text danger" onClick={() => setPendingDelete(client)}>
                {t.common.delete}
              </button>
            </div>
          )}
        />
      )}

      {pendingDelete && (
        <ConfirmDeleteOverlay
          title={t.adminClients.deleteTitle(`${pendingDelete.firstName} ${pendingDelete.lastName}`)}
          description={t.adminClients.deleteDescription}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}

      {viewingPetsFor && (
        <ClientPetsOverlay
          title={t.adminClients.petsTitle(`${viewingPetsFor.firstName} ${viewingPetsFor.lastName}`)}
          pets={clientPets}
          loading={petsLoading}
          error={petsError}
          onClose={closePetsView}
        />
      )}
    </>
  );
}
