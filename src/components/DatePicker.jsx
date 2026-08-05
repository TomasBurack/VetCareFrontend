import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/useLanguage';

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDateKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return { year, month: month - 1, day };
}

function formatDisplay(key) {
  if (!key) return '';
  const { year, month, day } = parseDateKey(key);
  return `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
}

export function DatePicker({ value, onChange, min, max, placeholder }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const base = value || min || toDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const { year, month } = parseDateKey(base);
    return { year, month };
  });
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstOfMonth = new Date(viewDate.year, viewDate.month, 1);
  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;

  const cells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function changeMonth(delta) {
    setViewDate(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  function selectDay(day) {
    const key = toDateKey(viewDate.year, viewDate.month, day);
    if (min && key < min) return;
    if (max && key > max) return;
    onChange(key);
    setOpen(false);
  }

  return (
    <div className="datepicker" ref={containerRef}>
      <input
        className="f"
        readOnly
        placeholder={placeholder ?? t.dates.selectDate}
        value={formatDisplay(value)}
        onClick={() => setOpen((v) => !v)}
      />
      {open && (
        <div className="datepicker-panel">
          <div className="datepicker-head">
            <button type="button" className="icon-btn" onClick={() => changeMonth(-1)}>
              ‹
            </button>
            <span>
              {t.dates.months[viewDate.month]} {viewDate.year}
            </span>
            <button type="button" className="icon-btn" onClick={() => changeMonth(1)}>
              ›
            </button>
          </div>
          <div className="datepicker-grid datepicker-weekdays">
            {t.dates.weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="datepicker-grid">
            {cells.map((day, i) => {
              if (day === null) return <span key={`blank-${i}`} />;
              const key = toDateKey(viewDate.year, viewDate.month, day);
              const disabled = (min && key < min) || (max && key > max);
              const selected = key === value;
              return (
                <button
                  type="button"
                  key={key}
                  className={`datepicker-day${selected ? ' selected' : ''}`}
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
