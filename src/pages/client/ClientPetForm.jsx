import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { petApi, breedsApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { FormCard } from '../../components/FormCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { Combobox } from '../../components/Combobox';
import { useToast } from '../../context/useToast';
import { useLanguage } from '../../i18n/useLanguage';

const PET_TYPE_VALUES = ['Canine', 'Feline', 'Avian', 'Reptile'];

const EMPTY_FORM = { name: '', typePet: 'Canine', age: '', breed: '' };

export function ClientPetForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();

  const [form, setForm] = useState(EMPTY_FORM);
  const [breeds, setBreeds] = useState([]);
  const [breedsAvailable, setBreedsAvailable] = useState(true);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    if (!isEditing) {
      loadBreeds(EMPTY_FORM.typePet, null);
      return;
    }
    petApi.getById(id).then((pet) => {
      setForm({ name: pet.name, typePet: pet.typePet, age: String(pet.age), breed: pet.breed });
      loadBreeds(pet.typePet, pet.breed);
    });
  }, [id, isEditing]);

  function handleTypeChange(e) {
    const typePet = e.target.value;
    setForm((prev) => ({ ...prev, typePet, breed: '' }));
    loadBreeds(typePet, null);
  }

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);

    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 0 || age > 100) {
      setErrors([t.pets.ageInvalid]);
      return;
    }

    setSubmitting(true);
    const payload = { name: form.name, typePet: form.typePet, age, breed: form.breed };
    try {
      if (isEditing) {
        await petApi.update(id, payload);
      } else {
        await petApi.create(payload);
      }
      toast.success(isEditing ? t.clientPetForm.updated : t.clientPetForm.created);
      navigate('/mis-mascotas');
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.clientPetForm.error];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="page-title">{isEditing ? t.clientPetForm.titleEdit : t.clientPetForm.titleNew}</h1>
      <p className="page-sub">{t.clientPetForm.subtitle}</p>
      <FormCard>
        <ErrorBanner messages={errors} />
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
              max="100"
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

          <div style={{ display: 'flex', gap: '.6rem' }}>
            <Button type="submit" disabled={submitting}>
              {submitting ? t.common.saving : t.clientPetForm.submit}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/mis-mascotas')}>
              {t.common.cancel}
            </Button>
          </div>
        </form>
      </FormCard>
    </>
  );
}
