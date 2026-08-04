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

const TYPE_LABELS = {
  Canine: 'Perro',
  Feline: 'Gato',
  Avian: 'Ave',
  Reptile: 'Reptil',
};

const PET_TYPES = [
  { value: 'Canine', label: 'Perro' },
  { value: 'Feline', label: 'Gato' },
  { value: 'Avian', label: 'Ave' },
  { value: 'Reptile', label: 'Reptil' },
];

const EMPTY_FORM = { name: '', typePet: 'Canine', age: '', breed: '' };

export function AdminPets() {
  const toast = useToast();
  const [pets, setPets] = useState([]);
  const [search, setSearch] = useState('');
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
      setErrors(err instanceof ApiError ? err.messages : ['No se pudieron cargar las mascotas.']);
    }
  }

  useEffect(() => {
    load();
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
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);

    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 0 || age > 100) {
      setErrors(['La edad debe ser un número entero entre 0 y 100.']);
      return;
    }

    setSubmitting(true);
    const payload = { name: form.name, typePet: form.typePet, age, breed: form.breed };
    try {
      await petApi.updateAdmin(editingId, payload);
      toast.success('Mascota actualizada correctamente.');
      closeForm();
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo guardar la mascota.'];
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
      toast.success('Mascota eliminada correctamente.');
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : ['No se pudo eliminar la mascota.'];
      setErrors(messages);
      toast.error(messages[0]);
      setPendingDelete(null);
    }
  }

  const filtered = pets.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.ownerName?.toLowerCase().includes(q) ||
      p.ownerEmail?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <h1 className="page-title">{editingId !== null ? 'Editar mascota' : 'Mascotas'}</h1>
      <p className="page-sub">
        {editingId !== null
          ? 'Modifica los datos de la mascota.'
          : 'Vista consolidada de todas las mascotas registradas por los clientes.'}
      </p>
      <ErrorBanner messages={errors} />
      <div className="toolbar">
        {editingId === null && (
          <input
            className="search"
            placeholder="Buscar por nombre de mascota o dueño…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
        {editingId !== null && (
          <Button variant="outline" onClick={closeForm}>
            Cancelar
          </Button>
        )}
      </div>

      {editingId !== null ? (
        <FormCard maxWidth={520}>
          <form onSubmit={handleSubmit}>
            <Field label="Nombre" required placeholder="Ej: Simón" value={form.name} onChange={update('name')} />
            <div className="grid cols-2">
              <Field label="Tipo" required>
                <select className="f" value={form.typePet} onChange={handleTypeChange}>
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
                max="100"
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

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </form>
        </FormCard>
      ) : (
        <EntityTable
          rows={filtered}
          keyField="idPet"
          columns={[
            { label: 'Nombre', render: (p) => p.name },
            { label: 'Tipo', render: (p) => TYPE_LABELS[p.typePet] ?? p.typePet },
            { label: 'Raza', render: (p) => p.breed },
            { label: 'Edad', render: (p) => `${p.age} años` },
            { label: 'Dueño', render: (p) => p.ownerName },
            { label: 'Email del dueño', render: (p) => p.ownerEmail },
          ]}
          renderActions={(pet) => (
            <div className="actions">
              <button className="btn-text" onClick={() => startEdit(pet)}>
                Modificar
              </button>
              <button className="btn-text danger" onClick={() => setPendingDelete(pet)}>
                Eliminar
              </button>
            </div>
          )}
        />
      )}

      {pendingDelete && (
        <ConfirmDeleteOverlay
          title={`Eliminar a ${pendingDelete.name}`}
          description="Esta acción elimina la mascota y su historial de turnos asociado. No se puede deshacer."
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
