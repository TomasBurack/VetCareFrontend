import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import { petApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDeleteOverlay } from '../../components/ConfirmDeleteOverlay';
import { useToast } from '../../context/useToast';

const TYPE_LABELS = {
  Canine: 'Perro',
  Feline: 'Gato',
  Avian: 'Ave',
  Reptile: 'Reptil',
};

const TYPE_EMOJIS = {
  Canine: '🐾',
  Feline: '🐱',
  Avian: '🐦',
  Reptile: '🦎',
};

export function ClientPets() {
  const toast = useToast();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await petApi.list();
      setPets(data ?? []);
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function confirmDelete() {
    try {
      await petApi.remove(pendingDelete.idPet);
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

  return (
    <>
      <h1 className="page-title">Mis mascotas</h1>
      <p className="page-sub">Registrá y administrá las mascotas asociadas a tu cuenta.</p>
      <ErrorBanner messages={errors} />
      <div className="toolbar">
        <div />
        <Link to="/mis-mascotas/nueva">
          <Button>+ Agregar mascota</Button>
        </Link>
      </div>

      {!loading && pets.length === 0 && (
        <EmptyState
          icon={<PawPrint size={28} />}
          message="Todavía no registraste mascotas"
          subtitle="Agregá tu primera mascota para empezar a solicitar turnos."
        />
      )}

      <div className="grid cols-3">
        {pets.map((pet) => (
          <div className="ficha" key={pet.idPet}>
            <div className="ficha-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '1.6rem' }}>{TYPE_EMOJIS[pet.typePet] ?? '🐾'}</div>
                <div className="actions">
                  <Link to={`/mis-mascotas/${pet.idPet}/editar`} className="icon-btn" title="Editar">
                    ✎
                  </Link>
                  <button className="icon-btn danger" title="Eliminar" onClick={() => setPendingDelete(pet)}>
                    ✕
                  </button>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.15rem', marginTop: '.5rem' }}>
                {pet.name}
              </div>
              <div style={{ fontSize: '.8rem', color: 'var(--sage-muted)' }}>
                {TYPE_LABELS[pet.typePet] ?? pet.typePet} · {pet.breed}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', marginTop: '.4rem', color: 'var(--sage-muted)' }}>
                {pet.age} años
              </div>
            </div>
          </div>
        ))}
      </div>

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
