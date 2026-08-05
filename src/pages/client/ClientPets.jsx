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
import { useLanguage } from '../../i18n/useLanguage';
import { translateBreed } from '../../i18n/breeds';

const TYPE_EMOJIS = {
  Canine: '🐾',
  Feline: '🐱',
  Avian: '🐦',
  Reptile: '🦎',
};

export function ClientPets() {
  const toast = useToast();
  const { t, language } = useLanguage();
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
      toast.success(t.clientPets.deleted);
      load();
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.clientPets.deleteError];
      setErrors(messages);
      toast.error(messages[0]);
      setPendingDelete(null);
    }
  }

  return (
    <>
      <h1 className="page-title">{t.clientPets.title}</h1>
      <p className="page-sub">{t.clientPets.subtitle}</p>
      <ErrorBanner messages={errors} />
      <div className="toolbar">
        <div />
        <Link to="/mis-mascotas/nueva">
          <Button>{t.clientPets.add}</Button>
        </Link>
      </div>

      {!loading && pets.length === 0 && (
        <EmptyState
          icon={<PawPrint size={28} />}
          message={t.clientPets.emptyTitle}
          subtitle={t.clientPets.emptySubtitle}
        />
      )}

      <div className="grid cols-3">
        {pets.map((pet) => (
          <div className="ficha" key={pet.idPet}>
            <div className="ficha-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '1.6rem' }}>{TYPE_EMOJIS[pet.typePet] ?? '🐾'}</div>
                <div className="actions">
                  <Link to={`/mis-mascotas/${pet.idPet}/editar`} className="icon-btn" title={t.common.edit}>
                    ✎
                  </Link>
                  <button className="icon-btn danger" title={t.common.delete} onClick={() => setPendingDelete(pet)}>
                    ✕
                  </button>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.15rem', marginTop: '.5rem' }}>
                {pet.name}
              </div>
              <div style={{ fontSize: '.8rem', color: 'var(--sage-muted)' }}>
                {t.pets.types[pet.typePet] ?? pet.typePet} · {language === 'es' ? translateBreed(pet.breed) : pet.breed}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', marginTop: '.4rem', color: 'var(--sage-muted)' }}>
                {pet.age} {t.common.years}
              </div>
            </div>
          </div>
        ))}
      </div>

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
