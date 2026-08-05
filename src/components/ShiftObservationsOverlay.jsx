import { useState } from 'react';
import { Button } from './Button';
import { useLanguage } from '../i18n/useLanguage';

export function ShiftObservationsOverlay({ initialValue, submitting, error, onCancel, onSave }) {
  const { t } = useLanguage();
  const [value, setValue] = useState(initialValue ?? '');

  function handleSubmit(e) {
    e.preventDefault();
    onSave(value);
  }

  return (
    <div className="overlay-backdrop" onClick={onCancel}>
      <div className="modal-mock" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-head">
            <span className="t">
              {initialValue ? t.vetShifts.editObservations : t.vetShifts.addObservations}
            </span>
          </div>
          <div className="modal-body">
            {error && <div className="error-banner">{error}</div>}
            <textarea
              className="f"
              rows="5"
              autoFocus
              placeholder={t.vetShifts.observationsPlaceholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>
          <div className="modal-foot">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t.common.saving : t.vetShifts.saveObservations}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
