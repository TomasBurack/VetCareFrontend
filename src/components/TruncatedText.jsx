import { useState } from 'react';

export function TruncatedText({ text, limit = 40, title = 'Detalle' }) {
  const [open, setOpen] = useState(false);

  if (!text) return null;
  if (text.length <= limit) return <span>{text}</span>;

  return (
    <>
      <span className="truncated-text" title="Ver texto completo" onClick={() => setOpen(true)}>
        {text.slice(0, limit).trimEnd()}…
      </span>
      {open && (
        <div className="overlay-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-mock" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="t">{title}</span>
              <button className="icon-btn" title="Cerrar" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
              {text}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
