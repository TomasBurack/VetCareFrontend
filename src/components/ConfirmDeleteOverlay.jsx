import { Button } from './Button';
import { useLanguage } from '../i18n/useLanguage';

export function ConfirmDeleteOverlay({ title, description, onCancel, onConfirm, confirmLabel }) {
  const { t } = useLanguage();
  const confirmText = confirmLabel ?? t.common.delete;

  return (
    <div className="overlay-backdrop" onClick={onCancel}>
      <div className="modal-mock" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="t">⚠️ {title}</span>
        </div>
        <div className="modal-body">{description}</div>
        <div className="modal-foot">
          <Button variant="outline" onClick={onCancel}>
            {t.common.cancel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
