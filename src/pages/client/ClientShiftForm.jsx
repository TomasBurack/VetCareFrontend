import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { petApi, shiftApi, veterinarianApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { FormCard } from '../../components/FormCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { Combobox } from '../../components/Combobox';
import { DatePicker } from '../../components/DatePicker';
import { useToast } from '../../context/useToast';
import { useLanguage } from '../../i18n/useLanguage';

function vetOptionLabel(vet) {
  return `${vet.firstName} ${vet.lastName} - ${vet.speciality}`;
}

function todayLocalDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().slice(0, 10);
}

const SHIFT_START_HOUR = 8;
const SHIFT_END_HOUR = 20;

const TIME_OPTIONS = Array.from({ length: (SHIFT_END_HOUR - SHIFT_START_HOUR) * 2 + 1 }, (_, i) => {
  const totalMinutes = SHIFT_START_HOUR * 60 + i * 30;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
});

export function ClientShiftForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const today = todayLocalDate();
  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [veterinarians, setVeterinarians] = useState([]);
  const [vetOption, setVetOption] = useState('');
  const [busyTimes, setBusyTimes] = useState([]);
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

  useEffect(() => {
    veterinarianApi
      .listForClient()
      .then((data) => setVeterinarians(data ?? []))
      .catch(() => setVeterinarians([]));
  }, []);

  const vetOptions = veterinarians.map(vetOptionLabel);
  const enrollment = veterinarians.find((vet) => vetOptionLabel(vet) === vetOption)?.enrollment ?? '';

  useEffect(() => {
    if (!enrollment || !date) {
      setBusyTimes([]);
      return;
    }
    shiftApi
      .busyTimes(enrollment, date)
      .then((data) => setBusyTimes(data ?? []))
      .catch(() => setBusyTimes([]));
  }, [enrollment, date]);

  const busyTimeSet = new Set(
    busyTimes.map((iso) => {
      const d = new Date(iso);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    })
  );

  useEffect(() => {
    if (time && busyTimeSet.has(time)) {
      setTime('');
    }
  }, [busyTimeSet, time]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    const dateShift = date && time ? `${date}T${time}:00-03:00` : null;
    if (dateShift && new Date(dateShift) < new Date()) {
      setErrors([t.clientShiftForm.pastDate]);
      return;
    }
    setSubmitting(true);
    try {
      await shiftApi.create({ petId, dateShift, description, enrollment });
      toast.success(t.clientShiftForm.created);
      navigate('/mis-turnos');
    } catch (err) {
      const messages = err instanceof ApiError ? err.messages : [t.clientShiftForm.error];
      setErrors(messages);
      toast.error(messages[0]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="page-title">{t.clientShiftForm.title}</h1>
      <p className="page-sub">{t.clientShiftForm.subtitle}</p>
      <FormCard>
        <ErrorBanner messages={errors} />
        <form onSubmit={handleSubmit}>
          <Field label={t.shifts.pet} required>
            <select className="f" value={petId} onChange={(e) => setPetId(e.target.value)} required>
              {pets.length === 0 && <option value="">{t.clientShiftForm.noPets}</option>}
              {pets.map((pet) => (
                <option key={pet.idPet} value={pet.idPet}>
                  {pet.name} — {pet.breed}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.shifts.veterinarian} required hint={t.clientShiftForm.vetHint}>
            <Combobox
              options={vetOptions}
              value={vetOption}
              onChange={setVetOption}
              placeholder={t.clientShiftForm.vetSearch}
            />
          </Field>
          <div className="grid cols-2">
            <Field label={t.shifts.date} required>
              <DatePicker value={date} onChange={setDate} min={today} />
            </Field>
            <Field
              label={t.shifts.time}
              required
              hint={
                enrollment ? t.clientShiftForm.timeHintWithVet : t.clientShiftForm.timeHintNoVet
              }
            >
              <select className="f" value={time} onChange={(e) => setTime(e.target.value)} required>
                <option value="" disabled>
                  {t.clientShiftForm.selectTime}
                </option>
                {TIME_OPTIONS.map((option) => (
                  <option key={option} value={option} disabled={busyTimeSet.has(option)}>
                    {option}
                    {busyTimeSet.has(option) ? t.clientShiftForm.timeBusySuffix : ''}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label={t.shifts.reason} required>
            <textarea
              className="f"
              rows="3"
              placeholder={t.clientShiftForm.descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Field>
          <div style={{ display: 'flex', gap: '.6rem' }}>
            <Button type="submit" disabled={submitting || pets.length === 0}>
              {submitting ? t.clientShiftForm.sending : t.clientShiftForm.submitConfirm}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/mis-turnos')}>
              {t.common.cancel}
            </Button>
          </div>
        </form>
      </FormCard>
    </>
  );
}
