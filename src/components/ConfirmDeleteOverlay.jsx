import { Button } from './Button';

export function ConfirmDeleteOverlay({ title, description, onCancel, onConfirm, confirmLabel = 'Eliminar' }) {
  return (
    <div className="overlay-backdrop" onClick={onCancel}>
      <div className="modal-mock" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="t">⚠️ {title}</span>
        </div>
        <div className="modal-body">{description}</div>
        <div className="modal-foot">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
