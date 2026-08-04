import { useEffect, useState } from 'react';
import { petApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { EntityTable } from '../../components/EntityTable';

const TYPE_LABELS = {
  Canine: 'Perro',
  Feline: 'Gato',
  Avian: 'Ave',
  Reptile: 'Reptil',
};

export function AdminPets() {
  const [pets, setPets] = useState([]);
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState([]);

  async function load() {
    try {
      const data = await petApi.allAdmin();
      setPets(data ?? []);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudieron cargar las mascotas.']);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount, no client-side data source to derive from
    load();
  }, []);

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
      <h1 className="page-title">Mascotas</h1>
      <p className="page-sub">Vista consolidada de todas las mascotas registradas por los clientes.</p>
      <ErrorBanner messages={errors} />
      <div className="toolbar">
        <input
          className="search"
          placeholder="Buscar por nombre de mascota o dueño…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
      />
    </>
  );
}
