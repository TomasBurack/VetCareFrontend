import { useEffect, useState } from 'react';
import { petApi, breedsApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { EntityTable } from '../../components/EntityTable';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';
import { Field } from '../../components/Field';
import { FormCard } from '../../components/FormCard';
import { Button } from '../../components/Button';
import { Combobox } from '../../components/Combobox';
import { useToast } from '../../context/useToast';
import { useLanguage } from '../../i18n/useLanguage';
import { translateBreed } from '../../i18n/breeds';

const PET_TYPE_VALUES = ['Canine', 'Feline', 'Avian', 'Reptile'];

const AGE_LIMITS = { Canine: 30, Feline: 35, Avian: 100, Reptile: 100 };
const AGE_MAX_MESSAGE_KEY = {
  Canine: 'ageMaxCanine',
  Feline: 'ageMaxFeline',
  Avian: 'ageMaxAvian',
  Reptile: 'ageMaxReptile',
};

const EMPTY_FORM = { name: '', typePet: 'Canine', age: '', breed: '' };

export function AdminPets() {
  const toast = useToast();
  const { t, language } = useLanguage();
  const [pets, setPets] = useState([]);
  const [errors, setErrors] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [breeds, setBreeds] = useState([]);
  const [breedsAvailable, setBreedsAvailable] = useState(true);

  async function load() {
    try {
      const data = await petApi.allAdmin();
      setPets(data ?? []);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : [t.adminPets.loadError]);
    }
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch on mount only; `load` closes over `t` but must not re-run on language change
  }, []);

  async function loadBreeds(typePet, currentBreed) {
    try {
      const list = await breedsApi.list(typePet);
      if (Array.isArray(list) && list.length > 0) {
        const uniqueList = [...new Set(list)];
        setBreeds(uniqueList);
        setBreedsAvailable(true);
        setForm((prev) => ({
          ...prev,
          breed: currentBreed && uniqueList.includes(currentBreed) ? currentBreed : prev.breed,
        }));
      } else {
        setBreedsAvailable(false);
        setForm((prev) => ({ ...prev, breed: currentBreed ?? prev.breed }));
      }
    } catch {
      setBreedsAvailable(false);
      setForm((prev) => ({ ...prev, breed: currentBreed ?? prev.breed }));
    }
  }

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleTypeChange(e) {
    const typePet = e.target.value;
    setForm((prev) => ({ ...prev, typePet, breed: '' }));
    loadBreeds(typePet, null);
  }

  function startEdit(pet) {
    setForm({ name: pet.name, typePet: pet.typePet, age: String(pet.age), breed: pet.breed });
    setEditingId(pet.idPet);
    loadBreeds(pet.typePet, pet.breed);
  }

  function closeForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setBreeds([]);
    setBreedsAvailable(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);

    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 0) {
      setErrors([t.pets.ageInvalid]);
      return;
    }
    const maxAge = AGE_LIMITS[form.typePet];
    if (age > maxAge) {
      setErrors([t.pets[AGE_MAX_MESSAGE_KEY[form.typePet]]]);
      return;
    }

    setSubmitting(true);
    const payload = { name: form.name, typePet: form.typePet, age, breed: form.breed };
    try {
      await petApi.updateAdmin(editingId, payload);
      toast.success(t.adminPets.updated);
      closeForm();
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.adminPets.saveError];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    try {
      await petApi.removeAdmin(pendingDelete.idPet);
      setPendingDelete(null);
      toast.success(t.adminPets.deleted);
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.adminPets.deleteError];
      setErrors(messages);
      toast.error(messages[0]);
      setPendingDelete(null);
    }
  }

  return (
    <>
      <h1 className="page-title">{editingId !== null ? t.adminPets.titleEdit : t.adminPets.title}</h1>
      <p className="page-sub">
        {editingId !== null ? t.adminPets.subtitleEdit : t.adminPets.subtitle}
      </p>
      <ErrorBanner messages={errors} />
      {editingId !== null && (
        <div className="toolbar">
          <Button variant="outline" onClick={closeForm}>
            {t.common.cancel}
          </Button>
        </div>
      )}

      {editingId !== null ? (
        <FormCard maxWidth={520}>
          <form onSubmit={handleSubmit}>
            <Field
              label={t.common.name}
              required
              placeholder={t.pets.namePlaceholder}
              value={form.name}
              onChange={update('name')}
            />
            <div className="grid cols-2">
              <Field label={t.pets.type} required>
                <select className="f" value={form.typePet} onChange={handleTypeChange}>
                  {PET_TYPE_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {t.pets.types[value]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={t.pets.age}
                type="number"
                required
                min="0"
                max={AGE_LIMITS[form.typePet]}
                placeholder={t.pets.agePlaceholder}
                value={form.age}
                onChange={update('age')}
              />
            </div>

            {breedsAvailable ? (
              <Field label={t.pets.breed} required hint={t.pets.breedHint}>
                <Combobox
                  options={breeds}
                  value={form.breed}
                  onChange={(breed) => setForm((prev) => ({ ...prev, breed }))}
                  placeholder={t.pets.breedSearch}
                  getLabel={language === 'es' ? translateBreed : undefined}
                />
              </Field>
            ) : (
              <Field
                label={t.pets.breed}
                required
                placeholder={t.pets.breedPlaceholder}
                value={form.breed}
                onChange={update('breed')}
              />
            )}

            <Button type="submit" disabled={submitting}>
              {submitting ? t.common.saving : t.common.saveChanges}
            </Button>
          </form>
        </FormCard>
      ) : (
        <EntityTable
          rows={pets}
          keyField="idPet"
          columns={[
            { label: t.common.name, render: (p) => p.name },
            {
              label: t.pets.type,
              render: (p) => t.pets.types[p.typePet] ?? p.typePet,
              sortKey: 'typePet',
              sortValue: (p) => t.pets.types[p.typePet] ?? p.typePet,
              filterVariant: 'select',
              filterOptions: PET_TYPE_VALUES.map((value) => ({
                value: t.pets.types[value],
                label: t.pets.types[value],
              })),
            },
            {
              label: t.pets.breed,
              render: (p) => (language === 'es' ? translateBreed(p.breed) : p.breed),
              sortKey: 'breed',
              sortValue: (p) => (language === 'es' ? translateBreed(p.breed) : p.breed),
            },
            { label: t.pets.ageShort, render: (p) => `${p.age} ${t.common.years}` },
            { label: t.pets.owner, render: (p) => p.ownerName },
            { label: t.pets.ownerEmail, render: (p) => p.ownerEmail },
          ]}
          renderActions={(pet) => (
            <div className="actions">
              <button className="btn-text" onClick={() => startEdit(pet)}>
                {t.common.edit}
              </button>
              <button className="btn-text danger" onClick={() => setPendingDelete(pet)}>
                {t.common.delete}
              </button>
            </div>
          )}
        />
      )}

      {pendingDelete && (
        <ConfirmDeleteOverlay
          title={t.pets.deleteTitle(pendingDelete.name)}
          description={t.pets.deleteDescription}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
