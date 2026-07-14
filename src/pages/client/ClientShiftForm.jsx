import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { petApi, shiftApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { FormCard } from '../../components/FormCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';

export function ClientShiftForm() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    petApi
      .list()
      .then((data) => {
        setPets(data ?? []);
        if (data?.length) setPetId(String(data[0].idPet));
      })
      .catch(() => setPets([]));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const dateShift = date && time ? new Date(`${date}T${time}`).toISOString() : null;
      await shiftApi.create({ petId, dateShift, description, enrollment });
      navigate('/mis-turnos');
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['No se pudo solicitar el turno.']);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="page-title">Solicitar turno</h1>
      <p className="page-sub">Elegí la mascota y describí el motivo de la consulta.</p>
      <FormCard>
        <ErrorBanner messages={errors} />
        <form onSubmit={handleSubmit}>
          <Field label="Mascota" required>
            <select className="f" value={petId} onChange={(e) => setPetId(e.target.value)} required>
              {pets.length === 0 && <option value="">No tenés mascotas registradas</option>}
              {pets.map((pet) => (
                <option key={pet.idPet} value={pet.idPet}>
                  {pet.name} — {pet.breed}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid cols-2">
            <Field label="Fecha" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            <Field label="Hora" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <Field label="Motivo de la consulta" required>
            <textarea
              className="f"
              rows="3"
              placeholder="Ej: control anual, vacunación, malestar…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Field>
          <Field
            label="Matrícula del veterinario"
            required
            placeholder="Ej: MP 4021"
            hint="Matrícula del veterinario con el que querés atenderte."
            value={enrollment}
            onChange={(e) => setEnrollment(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '.6rem' }}>
            <Button type="submit" disabled={submitting || pets.length === 0}>
              {submitting ? 'Enviando…' : 'Confirmar solicitud'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/mis-turnos')}>
              Cancelar
            </Button>
          </div>
        </form>
      </FormCard>
    </>
  );
}
