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

const PET_TYPES = [
  { value: 'Canine', label: 'Perro' },
  { value: 'Feline', label: 'Gato' },
  { value: 'Avian', label: 'Ave' },
  { value: 'Reptile', label: 'Reptil' },
];

const EMPTY_FORM = { name: '', typePet: 'Canine', age: '', breed: '' };

export function ClientPetForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [breeds, setBreeds] = useState([]);
  const [breedsAvailable, setBreedsAvailable] = useState(true);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [pendingBreed, setPendingBreed] = useState(null);

  useEffect(() => {
    if (!isEditing) return;
    petApi.getById(id).then((pet) => {
      setPendingBreed(pet.breed);
      setForm({ name: pet.name, typePet: pet.typePet, age: String(pet.age), breed: '' });
    });
  }, [id, isEditing]);

  useEffect(() => {
    let cancelled = false;
    breedsApi
      .list(form.typePet)
      .then((list) => {
        if (cancelled) return;
        if (Array.isArray(list) && list.length > 0) {
          const uniqueList = [...new Set(list)];
          setBreeds(uniqueList);
          setBreedsAvailable(true);
          setForm((prev) => ({
            ...prev,
            breed: pendingBreed && uniqueList.includes(pendingBreed) ? pendingBreed : prev.breed,
          }));
        } else {
          setBreedsAvailable(false);
          setForm((prev) => ({ ...prev, breed: pendingBreed ?? prev.breed }));
        }
        setPendingBreed(null);
      })
      .catch(() => {
        if (cancelled) return;
        setBreedsAvailable(false);
        setForm((prev) => ({ ...prev, breed: pendingBreed ?? prev.breed }));
        setPendingBreed(null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pendingBreed is read once per typePet change, not a reactive dependency
  }, [form.typePet]);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    const payload = { name: form.name, typePet: form.typePet, age: Number(form.age), breed: form.breed };
    try {
      if (isEditing) {
        await petApi.update(id, payload);
      } else {
        await petApi.create(payload);
      }
      toast.success(isEditing ? 'Mascota actualizada correctamente.' : 'Mascota creada correctamente.');
      navigate('/mis-mascotas');
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo guardar la mascota.'];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="page-title">{isEditing ? 'Editar mascota' : 'Agregar mascota'}</h1>
      <p className="page-sub">Completá los datos de tu mascota.</p>
      <FormCard>
        <ErrorBanner messages={errors} />
        <form onSubmit={handleSubmit}>
          <Field label="Nombre" required placeholder="Ej: Simón" value={form.name} onChange={update('name')} />
          <div className="grid cols-2">
            <Field label="Tipo" required>
              <select className="f" value={form.typePet} onChange={update('typePet')}>
                {PET_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Edad (años)"
              type="number"
              required
              min="0"
              placeholder="3"
              value={form.age}
              onChange={update('age')}
            />
          </div>

          {breedsAvailable ? (
            <Field label="Raza" required hint="Las razas se cargan desde el catálogo externo según el tipo de mascota elegido.">
              <Combobox
                options={breeds}
                value={form.breed}
                onChange={(breed) => setForm((prev) => ({ ...prev, breed }))}
                placeholder="Buscá una raza…"
              />
            </Field>
          ) : (
            <Field label="Raza" required placeholder="Ej: Mestizo" value={form.breed} onChange={update('breed')} />
          )}

          <div style={{ display: 'flex', gap: '.6rem' }}>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Guardar mascota'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/mis-mascotas')}>
              Cancelar
            </Button>
          </div>
        </form>
      </FormCard>
    </>
  );
}
