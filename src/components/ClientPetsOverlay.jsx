import { Button } from './Button';
import { useLanguage } from '../i18n/useLanguage';
import { translateBreed } from '../i18n/breeds';

export function ClientPetsOverlay({ title, pets, loading, error, onClose }) {
  const { t, language } = useLanguage();

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="modal-mock" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="t">{title}</span>
        </div>
        <div className="modal-body">
          {loading ? (
            t.common.loading
          ) : error ? (
            <div className="error-banner">{error}</div>
          ) : pets.length === 0 ? (
            t.adminClients.noPets
          ) : (
            <table className="pets-overlay-table">
              <thead>
                <tr>
                  <th>{t.common.name}</th>
                  <th>{t.pets.type}</th>
                  <th>{t.pets.breed}</th>
                  <th>{t.pets.ageShort}</th>
                </tr>
              </thead>
              <tbody>
                {pets.map((pet) => (
                  <tr key={pet.idPet}>
                    <td>{pet.name}</td>
                    <td>{t.pets.types[pet.typePet] ?? pet.typePet}</td>
                    <td>{language === 'es' ? translateBreed(pet.breed) : pet.breed}</td>
                    <td>
                      {pet.age} {t.common.years}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="modal-foot">
          <Button variant="outline" onClick={onClose}>
            {t.common.close}
          </Button>
        </div>
      </div>
    </div>
  );
}
