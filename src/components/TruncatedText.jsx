import { useState } from 'react';
import { useLanguage } from '../i18n/useLanguage';

export function TruncatedText({ text, limit = 40, title }) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const modalTitle = title ?? t.common.detail;

  if (!text) return null;
  if (text.length <= limit) return <span>{text}</span>;

  return (
    <>
      <span className="truncated-text" title={t.common.viewFullText} onClick={() => setOpen(true)}>
        {text.slice(0, limit).trimEnd()}…
      </span>
      {open && (
        <div className="overlay-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-mock" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="t">{modalTitle}</span>
              <button className="icon-btn" title={t.common.close} onClick={() => setOpen(false)}>
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
